VERSION = $(shell cat package.json | sed -n 's/.*"version": "\([^"]*\)",/\1/p')

SHELL = /usr/bin/env bash

default: build
.PHONY: test build build_unminified build_minified build_utils docs build_to_test


version:
	@echo $(VERSION)

install: 
	npm install
	jspm install

test:
	$$(npm bin)/karma start

docs:
	./generate_docs.js

build_unminified:
	$$(npm bin)/rollup -c

build_minified:
	$$(npm bin)/jspm build dist/ig_turfhelper.js dist/ig_turfhelper.min.js  --global-name turfHelper --global-deps '{"gmaps": "gmaps"}' -m


build_utils:
	UTILS=true $$(npm bin)/rollup -c

build:  build_unminified  build_minified test
	


update_version:
ifeq ($(shell expr "${VERSION}" \> "$(v)"),1)
	$(error "v" parameter is lower than current version ${VERSION})
endif
ifeq ($(v),)
	$(error v is undefined)
endif
ifeq (${VERSION},$(v))
	$(error v is already the current version)
endif
	@echo "Current version is " ${VERSION}
	@echo "Next version is " $(v)
	sed -i s/"$(VERSION)"/"$(v)"/g package.json


tag_and_push:
		git add --all
		git commit -a -m "Tag v $(v) $(m)"
		git tag v$(v)
		git push
		git push --tags


tag:  build docs update_version tag_and_push		
release: update_version  tag_and_push		
	
