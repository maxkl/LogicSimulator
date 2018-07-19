/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define(function () {
	function DisjointSetItem(data) {
		this.data = data;
		this.parent = this;
		this.size = 1;
	}

	// This implements a union-find data structure
	function DisjointSet () {
		this.items = [];
	}

	DisjointSet.prototype.makeSet = function (data) {
		var item = new DisjointSetItem(data);
		this.items.push(item);
		return item;
	};

	DisjointSet.prototype.find = function (item) {
		if (item.parent !== item) {
			item.parent = this.find(item.parent);
		}
		return item.parent;
	};

	DisjointSet.prototype.union = function (item1, item2) {
		var root1 = this.find(item1);
		var root2 = this.find(item2);

		if (root1 === root2) {
			return;
		}

		if (root1.size < root2.size) {
			root2.parent = root1;
			root1.size += root2.size;
		} else {
			root1.parent = root2;
			root2.size += root1.size;
		}
	};

	DisjointSet.prototype.getItemForData = function (data) {
		for (var i = 0; i < this.items.length; i++) {
			var item = this.items[i];

			if (item.data === data) {
				return item;
			}
		}

		return null;
	};

	DisjointSet.prototype.insert = function (data) {
		var item = this.getItemForData(data);
		if (item !== null) {
			// The data is already in a set, no need to insert it again
			return item;
		}

		return this.makeSet(data);
	};

	DisjointSet.prototype.getSets = function () {
		var sets = [];

		for (var i = 0; i < this.items.length; i++) {
			var root = this.items[i];

			// Check if this is really a root
			if (root.parent === root) {
				var set = [];
				for (var j = 0; j < this.items.length; j++) {
					var item = this.items[j];
					if (this.find(item) === root) {
						set.push(item);
					}
				}
				sets.push(set);
			}
		}

		return sets;
	};

	return DisjointSet;
});
