import chalk from 'chalk';

var _ = require('lodash');


const normalizeId = id => {
	if (id !== undefined) {
		return id.replace(__dirname, '');
	}
	return id;
};

export default function verbose(options = {}) {
	var dependency_tree = {};

	return {
		name: 'verbose plugin',

		onwrite: function (opts, bundle) {
			_.each(dependency_tree, function (branches, stem) {
				console.log(chalk.green(stem));
				_.each(branches, function (branchname) {
					console.log("\t" + '→ ' + chalk.cyan(branchname));
				});
			});
		},

		resolveId(importee, importer) {
			const imported_module = normalizeId(importee);
			const imported_from = normalizeId(importer);

			if (imported_from) {
				dependency_tree[imported_from] = dependency_tree[imported_from] || {};

				dependency_tree[imported_from][imported_module] = imported_module;

			}

			return null;
		},
	};
}
