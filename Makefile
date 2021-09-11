# ~~ Generated by projen. To modify, edit .projenrc.js and run "npx projen".

.EXPORT_ALL_VARIABLES:

.PHONY: all
all: default

.PHONY: build
build:                        ## Full release build (test+compile)
	@echo 🤖 Running task \\033[32mbuild\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	/bin/bash ./projen.bash
	@make compile
	@make test
	@make package
	@make readme-macros
	@echo 🤖 Finished task \\033[32mbuild\\033[0m.

.PHONY: bump
bump:                         ## Bumps version based on latest git tag and generates a changelog entry
	@echo 🤖 Running task \\033[32mbump\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	@export OUTFILE=package.json
	@export CHANGELOG=dist/changelog.md
	@export BUMPFILE=dist/version.txt
	node lib/release/bump-version.task.js
	@echo 🤖 Finished task \\033[32mbump\\033[0m.

.PHONY: clobber
clobber:                      ## hard resets to HEAD of origin and cleans the local repo
	@echo 🤖 Running task \\033[32mclobber\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	@export BRANCH=$(shell git branch --show-current)
	git checkout -b scratch
	git checkout $BRANCH
	git fetch origin
	git reset --hard origin/$BRANCH
	git clean -fdx
	@echo ready to rock! (unpushed commits are under the "scratch" branch)
	@echo 🤖 Finished task \\033[32mclobber\\033[0m.

.PHONY: compat
compat:                       ## Perform API compatibility check against latest version
	@echo 🤖 Running task \\033[32mcompat\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	jsii-diff npm:$(node -p "require('./package.json').name") -k --ignore-file .compatignore || (echo "\nUNEXPECTED BREAKING CHANGES: add keys such as 'removed:constructs.Node.of' to .compatignore to skip.\n" && exit 1)
	@echo 🤖 Finished task \\033[32mcompat\\033[0m.

.PHONY: compile
compile:                      ## Only compile
	@echo 🤖 Running task \\033[32mcompile\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	jsii --silence-warnings=reserved-word --no-fix-peer-dependencies
	@make docgen
	@echo 🤖 Finished task \\033[32mcompile\\033[0m.

.PHONY: contributors-update
contributors-update:          ## No description
	@echo 🤖 Running task \\033[32mcontributors:update\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	all-contributors check | grep "Missing contributors" -A 1 | tail -n1 | sed -e "s/,//g" | xargs -n1 | grep -v "[bot]" | xargs -n1 -I{} all-contributors add {} code
	@echo 🤖 Finished task \\033[32mcontributors:update\\033[0m.

.PHONY: default
default:                      ## No description
	@echo 🤖 Running task \\033[32mdefault\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	node .projenrc.js
	@echo 🤖 Finished task \\033[32mdefault\\033[0m.

.PHONY: devenv-setup
devenv-setup:                 ## No description
	@echo 🤖 Running task \\033[32mdevenv:setup\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	yarn install
	@make build
	@echo 🤖 Finished task \\033[32mdevenv:setup\\033[0m.

.PHONY: docgen
docgen:                       ## Generate API.md from .jsii manifest
	@echo 🤖 Running task \\033[32mdocgen\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	jsii-docgen
	@echo 🤖 Finished task \\033[32mdocgen\\033[0m.

.PHONY: eslint
eslint:                       ## Runs eslint against the codebase
	@echo 🤖 Running task \\033[32meslint\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	eslint --ext .ts,.tsx --fix --no-error-on-unmatched-pattern src src/__tests__ build-tools .projenrc.js
	@echo 🤖 Finished task \\033[32meslint\\033[0m.

.PHONY: package
package:                      ## Create an npm tarball
	@echo 🤖 Running task \\033[32mpackage\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	jsii-pacmak
	@echo 🤖 Finished task \\033[32mpackage\\033[0m.

.PHONY: publish-github
publish-github:               ## Publish this package to GitHub Releases
	@echo 🤖 Running task \\033[32mpublish:github\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	errout=$(mktemp); gh release create v$(cat dist/version.txt) -R $GITHUB_REPOSITORY -F dist/changelog.md -t v$(cat dist/version.txt) 2> $errout && true; exitcode=$?; if [ $exitcode -ne 0 ] && ! grep -q "Release.tag_name already exists" $errout; then cat $errout; exit $exitcode; fi
	@echo 🤖 Finished task \\033[32mpublish:github\\033[0m.

.PHONY: publish-maven
publish-maven:                ## Publish this package to Maven Central
	@echo 🤖 Running task \\033[32mpublish:maven\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	@export MAVEN_ENDPOINT=https://s01.oss.sonatype.org
	npx -p jsii-release@latest jsii-release-maven
	@echo 🤖 Finished task \\033[32mpublish:maven\\033[0m.

.PHONY: publish-npm
publish-npm:                  ## Publish this package to npm
	@echo 🤖 Running task \\033[32mpublish:npm\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	@export NPM_DIST_TAG=latest
	@export NPM_REGISTRY=registry.npmjs.org
	npx -p jsii-release@latest jsii-release-npm
	@echo 🤖 Finished task \\033[32mpublish:npm\\033[0m.

.PHONY: publish-pypi
publish-pypi:                 ## Publish this package to PyPI
	@echo 🤖 Running task \\033[32mpublish:pypi\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	npx -p jsii-release@latest jsii-release-pypi
	@echo 🤖 Finished task \\033[32mpublish:pypi\\033[0m.

.PHONY: readme-macros
readme-macros:                ## No description
	@echo 🤖 Running task \\033[32mreadme-macros\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	mv README.md README.md.bak
	cat README.md.bak | markmac > README.md
	rm README.md.bak
	@echo 🤖 Finished task \\033[32mreadme-macros\\033[0m.

.PHONY: release
release:                      ## Prepare a release from "main" branch
	@echo 🤖 Running task \\033[32mrelease\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	@export RELEASE=true
	rm -fr dist
	@make bump
	@make build
	@make unbump
	git diff --ignore-space-at-eol --exit-code
	@echo 🤖 Finished task \\033[32mrelease\\033[0m.

.PHONY: test
test:                         ## Run tests
	@echo 🤖 Running task \\033[32mtest\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	@make test-compile
	jest --passWithNoTests --all --updateSnapshot
	@make eslint
	@echo 🤖 Finished task \\033[32mtest\\033[0m.

.PHONY: test-compile
test-compile:                 ## compiles the test code
	@echo 🤖 Running task \\033[32mtest:compile\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	@echo 🤖 Finished task \\033[32mtest:compile\\033[0m.

.PHONY: test-update
test-update:                  ## Update jest snapshots
	@echo 🤖 Running task \\033[32mtest:update\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	jest --updateSnapshot
	@echo 🤖 Finished task \\033[32mtest:update\\033[0m.

.PHONY: test-watch
test-watch:                   ## Run jest in watch mode
	@echo 🤖 Running task \\033[32mtest:watch\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	jest --watch
	@echo 🤖 Finished task \\033[32mtest:watch\\033[0m.

.PHONY: unbump
unbump:                       ## Restores version to 0.0.0
	@echo 🤖 Running task \\033[32munbump\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	@export OUTFILE=package.json
	@export CHANGELOG=dist/changelog.md
	@export BUMPFILE=dist/version.txt
	node lib/release/reset-version.task.js
	@echo 🤖 Finished task \\033[32munbump\\033[0m.

.PHONY: upgrade
upgrade:                      ## upgrade dependencies
	@echo 🤖 Running task \\033[32mupgrade\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	@export CI=0
	npm-check-updates --upgrade --target=minor --reject='projen'
	yarn install --check-files
	yarn upgrade @types/fs-extra @types/glob @types/ini @types/jest @types/node @types/semver @types/yargs @typescript-eslint/eslint-plugin @typescript-eslint/parser all-contributors-cli eslint eslint-import-resolver-node eslint-import-resolver-typescript eslint-plugin-import jest jest-junit jsii jsii-diff jsii-docgen jsii-pacmak json-schema markmac npm-check-updates standard-version typescript @iarna/toml chalk decamelize fs-extra glob ini semver shx xmlbuilder2 yaml yargs
	/bin/bash ./projen.bash
	@echo 🤖 Finished task \\033[32mupgrade\\033[0m.

.PHONY: watch
watch:                        ## Watch & compile in the background
	@echo 🤖 Running task \\033[32mwatch\\033[0m...
	@export PATH=$(shell npx -c "node -e \"console.log(process.env.PATH)\"")
	jsii -w --silence-warnings=reserved-word --no-fix-peer-dependencies
	@echo 🤖 Finished task \\033[32mwatch\\033[0m.

.PHONY: help
help:                         ## Show help messages for make targets
	@echo "\033[1;39mCOMMANDS:\033[0m"; grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\t\033[32m%-30s\033[0m %s\n", $$1, $$2}'
