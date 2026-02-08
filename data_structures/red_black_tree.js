// Copyright 2018-2026 the Deno authors. MIT license.
// This module is browser compatible.
import { ascend } from "./comparators.js";
import { BinarySearchTree } from "./binary_search_tree.js";
import { RedBlackNode } from "./_red_black_node.js";
import { internals } from "./_binary_search_tree_internals.js";
const {
  getRoot,
  setRoot,
  getCompare,
  findNode,
  rotateNode,
  insertNode,
  removeNode,
  setSize,
} = internals;
/**
 * A red-black tree. This is a kind of self-balancing binary search tree. The
 * values are in ascending order by default, using JavaScript's built-in
 * comparison operators to sort the values.
 *
 * Red-Black Trees require fewer rotations than AVL Trees, so they can provide
 * faster insertions and removal operations. If you need faster lookups, you
 * should use an AVL Tree instead. AVL Trees are more strictly balanced than
 * Red-Black Trees, so they can provide faster lookups.
 *
 * | Method        | Average Case | Worst Case |
 * | ------------- | ------------ | ---------- |
 * | find(value)   | O(log n)     | O(log n)   |
 * | insert(value) | O(log n)     | O(log n)   |
 * | remove(value) | O(log n)     | O(log n)   |
 * | min()         | O(log n)     | O(log n)   |
 * | max()         | O(log n)     | O(log n)   |
 *
 * @example Usage
 * ```ts
 * import {
 *   ascend,
 *   descend,
 *   RedBlackTree,
 * } from "../data-structures/mod.js";
 * import { assertEquals } from "../assert/mod.js";
 *
 * const values = [3, 10, 13, 4, 6, 7, 1, 14];
 * const tree = new RedBlackTree<number>();
 * values.forEach((value) => tree.insert(value));
 * assertEquals([...tree], [1, 3, 4, 6, 7, 10, 13, 14]);
 * assertEquals(tree.min(), 1);
 * assertEquals(tree.max(), 14);
 * assertEquals(tree.find(42), null);
 * assertEquals(tree.find(7), 7);
 * assertEquals(tree.remove(42), false);
 * assertEquals(tree.remove(7), true);
 * assertEquals([...tree], [1, 3, 4, 6, 10, 13, 14]);
 *
 * const invertedTree = new RedBlackTree<number>(descend);
 * values.forEach((value) => invertedTree.insert(value));
 * assertEquals([...invertedTree], [14, 13, 10, 7, 6, 4, 3, 1]);
 * assertEquals(invertedTree.min(), 14);
 * assertEquals(invertedTree.max(), 1);
 * assertEquals(invertedTree.find(42), null);
 * assertEquals(invertedTree.find(7), 7);
 * assertEquals(invertedTree.remove(42), false);
 * assertEquals(invertedTree.remove(7), true);
 * assertEquals([...invertedTree], [14, 13, 10, 6, 4, 3, 1]);
 *
 * const words = new RedBlackTree<string>((a, b) =>
 *   ascend(a.length, b.length) || ascend(a, b)
 * );
 * ["truck", "car", "helicopter", "tank", "train", "suv", "semi", "van"]
 *   .forEach((value) => words.insert(value));
 * assertEquals([...words], [
 *   "car",
 *   "suv",
 *   "van",
 *   "semi",
 *   "tank",
 *   "train",
 *   "truck",
 *   "helicopter",
 * ]);
 * assertEquals(words.min(), "car");
 * assertEquals(words.max(), "helicopter");
 * assertEquals(words.find("scooter"), null);
 * assertEquals(words.find("tank"), "tank");
 * assertEquals(words.remove("scooter"), false);
 * assertEquals(words.remove("tank"), true);
 * assertEquals([...words], [
 *   "car",
 *   "suv",
 *   "van",
 *   "semi",
 *   "train",
 *   "truck",
 *   "helicopter",
 * ]);
 * ```
 *
 * @typeparam T The type of the values being stored in the tree.
 */
export class RedBlackTree extends BinarySearchTree {
  /**
   * Construct an empty red-black tree.
   *
   * @param compare A custom comparison function for the values. The default comparison function sorts by ascending order.
   */
  constructor(compare = ascend) {
    if (typeof compare !== "function") {
      throw new TypeError(
        "Cannot construct a RedBlackTree: the 'compare' parameter is not a function, did you mean to call RedBlackTree.from?",
      );
    }
    super(compare);
  }
  static from(collection, options) {
    let result;
    let unmappedValues = [];
    if (collection instanceof RedBlackTree) {
      result = new RedBlackTree(
        options?.compare ??
          getCompare(collection),
      );
      if (options?.compare || options?.map) {
        unmappedValues = collection;
      } else {
        const nodes = [];
        const root = getRoot(collection);
        if (root) {
          setRoot(result, root);
          nodes.push(root);
        }
        while (nodes.length) {
          const node = nodes.pop();
          const left = node.left ? RedBlackNode.from(node.left) : null;
          const right = node.right ? RedBlackNode.from(node.right) : null;
          if (left) {
            left.parent = node;
            nodes.push(left);
          }
          if (right) {
            right.parent = node;
            nodes.push(right);
          }
        }
        setSize(result, collection.size);
      }
    } else {
      result = options?.compare
        ? new RedBlackTree(options.compare)
        : new RedBlackTree();
      unmappedValues = collection;
    }
    const values = options?.map
      ? Array.from(unmappedValues, options.map, options.thisArg)
      : unmappedValues;
    for (const value of values) {
      result.insert(value);
    }
    return result;
  }
  #removeFixup(parent, current) {
    while (parent && !current?.red) {
      const direction = parent.left === current ? "left" : "right";
      const siblingDirection = direction === "right" ? "left" : "right";
      let sibling = parent[siblingDirection];
      if (sibling?.red) {
        sibling.red = false;
        parent.red = true;
        rotateNode(this, parent, direction);
        sibling = parent[siblingDirection];
      }
      if (sibling) {
        if (!sibling.left?.red && !sibling.right?.red) {
          sibling.red = true;
          current = parent;
          parent = current.parent;
        } else {
          if (!sibling[siblingDirection]?.red) {
            sibling[direction].red = false;
            sibling.red = true;
            rotateNode(this, sibling, siblingDirection);
            sibling = parent[siblingDirection];
          }
          sibling.red = parent.red;
          parent.red = false;
          sibling[siblingDirection].red = false;
          rotateNode(this, parent, direction);
          current = getRoot(this);
          parent = null;
        }
      }
    }
    if (current) {
      current.red = false;
    }
  }
  /**
   * Add a value to the red-black tree if it does not already exist in the tree.
   *
   * The complexity of this operation is on average and at worst O(log n), where
   * n is the number of values in the tree.
   *
   * @example Inserting a value into the tree
   * ```ts
   * import { RedBlackTree } from "../data-structures/mod.js";
   * import { assertEquals } from "../assert/mod.js";
   *
   * const tree = new RedBlackTree<number>();
   *
   * assertEquals(tree.insert(42), true);
   * assertEquals(tree.insert(42), false);
   * ```
   *
   * @param value The value to insert into the tree.
   * @returns `true` if the value was inserted, `false` if the value already exists in the tree.
   */
  insert(value) {
    let node = insertNode(this, RedBlackNode, value);
    if (node) {
      while (node.parent?.red) {
        let parent = node.parent;
        const parentDirection = parent.directionFromParent();
        const uncleDirection = parentDirection === "right" ? "left" : "right";
        const uncle = parent.parent[uncleDirection] ??
          null;
        if (uncle?.red) {
          parent.red = false;
          uncle.red = false;
          parent.parent.red = true;
          node = parent.parent;
        } else {
          if (node === parent[uncleDirection]) {
            node = parent;
            rotateNode(this, node, parentDirection);
            parent = node.parent;
          }
          parent.red = false;
          parent.parent.red = true;
          rotateNode(this, parent.parent, uncleDirection);
        }
      }
      getRoot(this).red = false;
    }
    return !!node;
  }
  /**
   * Remove a value from the red-black tree if it exists in the tree.
   *
   * The complexity of this operation is on average and at worst O(log n), where
   * n is the number of values in the tree.
   *
   * @example Removing values from the tree
   * ```ts
   * import { RedBlackTree } from "../data-structures/mod.js";
   * import { assertEquals } from "../assert/mod.js";
   *
   * const tree = RedBlackTree.from<number>([42]);
   *
   * assertEquals(tree.remove(42), true);
   * assertEquals(tree.remove(42), false);
   * ```
   *
   * @param value The value to remove from the tree.
   * @returns `true` if the value was found and removed, `false` if the value was not found in the tree.
   */
  remove(value) {
    const node = findNode(this, value);
    if (!node) {
      return false;
    }
    const removedNode = removeNode(this, node);
    if (removedNode && !removedNode.red) {
      this.#removeFixup(
        removedNode.parent,
        removedNode.left ?? removedNode.right,
      );
    }
    return true;
  }
}
