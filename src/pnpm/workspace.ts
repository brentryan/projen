import { SampleDir, Task, YamlFile } from '..';
import { PROJEN_RC } from '../common';
import { NodePackage, NodePackageManager, NodePackageOptions } from '../javascript';
import { Projenrc as ProjenrcTs, ProjenrcOptions as ProjenrcTsOptions } from '../pnpm';
import { Project, ProjectOptions } from '../project';
import { SampleReadme, SampleReadmeProps } from '../readme';
import { VsCode } from '../vscode';

const PROJEN_SCRIPT = 'projen';

/**
 * Options for `PnpmWorkspaceProject`.
 */
export interface PnpmWorkspaceProjectOptions extends ProjectOptions, NodePackageOptions {
  /**
   * The README setup.
   *
   * @default - { filename: 'README.md', contents: '# replace this' }
   * @example "{ filename: 'readme.md', contents: '# title' }"
   */
  readonly readme?: SampleReadmeProps;
  /**
    * Version of projen to install.
    *
    * @default - Defaults to the latest version.
    */
  readonly projenVersion?: string;
  /**
    * Indicates of "projen" should be installed as a devDependency.
    *
    * @default true
    */
  readonly projenDevDependency?: boolean;
  /**
   * Additional entries to .gitignore
   */
  readonly gitignore?: string[];
  /**
   * Use TypeScript for your projenrc file (`.projenrc.ts`).
   *
   * @default false
   */
  readonly projenrcTs?: boolean;
  /**
     * Options for .projenrc.ts
     */
  readonly projenrcTsOptions?: ProjenrcTsOptions;
}

/**
 * A pnpm workspace for mono repositories managed by pnpm.
 *
 * @pjid pnpm-workspace
 */
export class PnpmWorkspaceProject extends Project {
  /**
   * API for managing the node package.
   */
  public readonly package: NodePackage;
  /**
   * Access all VSCode components.
   */
  public readonly vscode: VsCode;
  constructor(options: PnpmWorkspaceProjectOptions) {
    super(options);

    this.package = new NodePackage(this, {
      ...options,
      packageManager: NodePackageManager.PNPM,
    });
    new YamlFile(this, 'pnpm-workspace.yaml', {
      obj: {
        packages: [
          'packages/**',
          '!**/cdk.out/**',
          '!**/__fixtures__/**"',
        ],
      },
    });
    this.vscode = new VsCode(this);
    new SampleReadme(this, options.readme);
    new SampleDir(this, 'packages', {
      files: {
        '.gitkeep': '',
      },
    });
    // add PATH for all tasks which includes the project's npm .bin list
    this.tasks.addEnvironment('PATH', '$(npx -c "node -e \\\"console.log(process.env.PATH)\\\"")');
    this.addDefaultGitIgnore();

    if (options.gitignore?.length) {
      for (const i of options.gitignore) {
        this.gitignore.exclude(i);
      }
    }
    this.setScript(PROJEN_SCRIPT, this.package.projenCommand);
    this.gitignore.include(`/${PROJEN_RC}`);

    const projen = options.projenDevDependency ?? true;
    if (projen) {
      const postfix = options.projenVersion ? `@${options.projenVersion}` : '';
      this.addDevDeps(`projen${postfix}`);
    }

    new ProjenrcTs(this, options.projenrcTsOptions);
  }

  public addBins(bins: Record<string, string>) {
    this.package.addBin(bins);
  }

  /**
   * Replaces the contents of an npm package.json script.
   *
   * @param name The script name
   * @param command The command to execute
   */
  public setScript(name: string, command: string) {
    this.package.setScript(name, command);
  }

  /**
   * Removes the npm script (always successful).
   * @param name The name of the script.
   */
  public removeScript(name: string) {
    this.package.removeScript(name);
  }

  /**
   * Indicates if a script by the name name is defined.
   * @param name The name of the script
   */
  public hasScript(name: string) {
    return this.package.hasScript(name);
  }

  /**
   * Directly set fields in `package.json`.
   * @param fields The fields to set
   */
  public addFields(fields: { [name: string]: any }) {
    for (const [name, value] of Object.entries(fields)) {
      this.package.addField(name, value);
    }
  }

  /**
   * Adds keywords to package.json (deduplicated)
   * @param keywords The keywords to add
   */
  public addKeywords(...keywords: string[]) {
    this.package.addKeywords(...keywords);
  }

  /**
   * Defines normal dependencies.
   *
   * @param deps Names modules to install. By default, the the dependency will
   * be installed in the next `npx projen` run and the version will be recorded
   * in your `package.json` file. You can upgrade manually or using `yarn
   * add/upgrade`. If you wish to specify a version range use this syntax:
   * `module@^7`.
   */
  public addDeps(...deps: string[]) {
    return this.package.addDeps(...deps);
  }

  /**
       * Defines development/test dependencies.
       *
       * @param deps Names modules to install. By default, the the dependency will
       * be installed in the next `npx projen` run and the version will be recorded
       * in your `package.json` file. You can upgrade manually or using `yarn
       * add/upgrade`. If you wish to specify a version range use this syntax:
       * `module@^7`.
       */
  public addDevDeps(...deps: string[]) {
    return this.package.addDevDeps(...deps);
  }

  /**
       * Defines peer dependencies.
       *
       * When adding peer dependencies, a devDependency will also be added on the
       * pinned version of the declared peer. This will ensure that you are testing
       * your code against the minimum version required from your consumers.
       *
       * @param deps Names modules to install. By default, the the dependency will
       * be installed in the next `npx projen` run and the version will be recorded
       * in your `package.json` file. You can upgrade manually or using `yarn
       * add/upgrade`. If you wish to specify a version range use this syntax:
       * `module@^7`.
       */
  public addPeerDeps(...deps: string[]) {
    return this.package.addPeerDeps(...deps);
  }

  /**
       * Defines bundled dependencies.
       *
       * Bundled dependencies will be added as normal dependencies as well as to the
       * `bundledDependencies` section of your `package.json`.
       *
       * @param deps Names modules to install. By default, the the dependency will
       * be installed in the next `npx projen` run and the version will be recorded
       * in your `package.json` file. You can upgrade manually or using `yarn
       * add/upgrade`. If you wish to specify a version range use this syntax:
       * `module@^7`.
       */
  public addBundledDeps(...deps: string[]) {
    return this.package.addBundledDeps(...deps);
  }

  private addDefaultGitIgnore() {
    this.gitignore.exclude(
      '# Logs',
      'logs',
      '*.log',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      'lerna-debug.log*',

      '# Diagnostic reports (https://nodejs.org/api/report.html)',
      'report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json',

      '# Runtime data',
      'pids',
      '*.pid',
      '*.seed',
      '*.pid.lock',

      '# Directory for instrumented libs generated by jscoverage/JSCover',
      'lib-cov',

      '# Coverage directory used by tools like istanbul',
      'coverage',
      '*.lcov',

      '# nyc test coverage',
      '.nyc_output',

      '# Compiled binary addons (https://nodejs.org/api/addons.html)',
      'build/Release',

      '# Dependency directories',
      'node_modules/',
      'jspm_packages/',

      '# TypeScript cache',
      '*.tsbuildinfo',


      '# Optional eslint cache',
      '.eslintcache',

      '# Output of \'npm pack\'',
      '*.tgz',

      '# Yarn Integrity file',
      '.yarn-integrity',

      '# parcel-bundler cache (https://parceljs.org/)',
      '.cache',
    );
  }

  /**
     * Returns the shell command to execute in order to run a task. This will
     * typically be `npx projen TASK`.
     *
     * @param task The task for which the command is required
     */
  public runTaskCommand(task: Task) {
    return `${this.package.projenCommand} ${task.name}`;
  }
}