import { existsSync } from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import { cleanup } from './cleanup';
import { printStartMenu } from './cli/cmds/start-app';
import { PROJEN_RC } from './common';
import { Component } from './component';
import { FileBase } from './file';
import { GitHub } from './github';
import { IgnoreFile } from './ignore-file';
import * as logging from './logging';
import { SampleReadme } from './readme';
import { Start } from './start';
import { VsCode } from './vscode';

export interface ProjectOptions {
  /**
   * The parent project, if this project is part of a bigger project.
   */
  readonly parent?: Project;

  /**
   * The root directory of the project.
   *
   * Relative to this directory, all files are synthesized.
   *
   * If this project has a parent, this directory is relative to the parent
   * directory and it cannot be the same as the parent or any of it's other
   * sub-projects.
   *
   * @default "."
   */
  readonly outdir?: string;
}

/**
 * Base project
 */
export class Project {
  /**
   * .gitignore
   */
  public readonly gitignore: IgnoreFile;

  /**
   * A parent project. If undefined, this is the root project.
   */
  public readonly parent?: Project;

  /**
   * Absolute output directory of this project.
   */
  public readonly outdir: string;

  /**
   * The root project.
   **/
  public readonly root: Project;

  private readonly components = new Array<Component>();
  private readonly subprojects = new Array<Project>();
  private readonly tips = new Array<string>();

  /**
   * Access all github components.
   */
  public readonly github?: GitHub;

  /**
   * Access all VSCode components.
   */
  public readonly vscode?: VsCode;

  constructor(options: ProjectOptions = { }) {
    this.parent = options.parent;

    if (this.parent && options.outdir && path.isAbsolute(options.outdir)) {
      throw new Error('"outdir" must be a relative path');
    }

    let outdir;
    if (options.parent) {
      if (!options.outdir) {
        throw new Error('"outdir" must be specified for subprojects');
      }

      outdir = path.join(options.parent.outdir, options.outdir);
    } else {
      outdir = options.outdir ?? '.';
    }

    if (outdir === '.') {
      if (!existsSync(path.join(outdir, PROJEN_RC))) {
        throw new Error('cannot use outdir="." because projenrc.js does not exist in the current directory');
      }
    }

    this.outdir = path.resolve(outdir);

    this.root = this.parent ? this.parent.root : this;

    // must happen after this.outdir, this.parent and this.root are initialized
    this.parent?._addSubProject(this);

    // ------------------------------------------------------------------------

    this.gitignore = new IgnoreFile(this, '.gitignore');
    this.github = new GitHub(this);
    this.vscode = new VsCode(this);
    new SampleReadme(this, '# my project');
  }

  /**
   * All files in this project.
   */
  public get files(): FileBase[] {
    const isFile = (c: Component): c is FileBase => c instanceof FileBase;
    return this.components.filter(isFile).sort((f1, f2) => f1.path.localeCompare(f2.path));
  }

  /**
   * Finds a file at the specified relateive path within this project and all
   * its subprojects.
   *
   * @param filePath The file path. If this path is relative, it will be resolved
   * from the root of _this_ project.
   * @returns a `FileBase` or undefined if there is no file in that path
   */
  public findFile(filePath: string): FileBase | undefined {
    const absolute = path.isAbsolute(filePath) ? filePath : path.resolve(this.outdir, filePath);
    for (const file of this.files) {
      if (absolute === file.absolutePath) {
        return file;
      }
    }

    for (const child of this.subprojects) {
      const file = child.findFile(absolute);
      if (file) {
        return file;
      }
    }

    return undefined;
  }

  /**
   * Prints a "tip" message during synthesis.
   * @param message The message
   */
  public addTip(message: string) {
    this.tips.push(message);
  }

  /**
   * Synthesize all project files into `outdir`.
   *
   * 1. Call "this.preSynthesize()"
   * 2. Delete all generated files
   * 3. Synthesize all sub-projects
   * 4. Synthezize all components of this project
   * 5. Call "postSynthesize()" for all components of this project
   * 6. Call "this.postSynthesize()"
   */
  public synth(): void {
    const outdir = this.outdir;
    this.preSynthesize();

    // delete all generated files before we start synthesizing new ones
    cleanup(outdir);

    for (const subproject of this.subprojects) {
      subproject.synth();
    }

    for (const comp of this.components) {
      comp.synthesize();
    }

    for (const comp of this.components) {
      comp.postSynthesize();
    }

    // project-level hook
    this.postSynthesize();


    logging.info('Synthesis complete');

    const start = this.components.find(c => c instanceof Start);
    if (start) {
      console.error();
      console.error('-'.repeat(100));
      printStartMenu(outdir);
    }

    if (this.tips.length) {
      console.error(chalk.cyanBright.underline('Tips:'));
      for (const tip of this.tips) {
        console.error(`💡 ${tip}`);
      }
    }
  }

  /**
   * Called before all components are synthesized.
   */
  public preSynthesize() {}

  /**
   * Called after all components are synthesized. Order is *not* guaranteed.
   */
  public postSynthesize() {}

  /**
   * Adds a component to the project.
   * @internal
   */
  public _addComponent(component: Component) {
    this.components.push(component);
  }

  /**
   * Adds a sub-project to this project.
   *
   * This is automatically called when a new project is created with `parent`
   * pointing to this project, so there is no real need to call this manually.
   *
   * @param sub-project The child project to add.
   * @internal
   */
  _addSubProject(subproject: Project) {
    if (subproject.parent !== this) {
      throw new Error('"parent" of child project must be this project');
    }

    // check that `outdir` is exclusive
    for (const p of this.subprojects) {
      if (path.resolve(p.outdir) === path.resolve(subproject.outdir)) {
        throw new Error(`there is already a sub-project with "outdir": ${subproject.outdir}`);
      }
    }

    this.subprojects.push(subproject);
  }
}
