import gsap from 'gsap';
import { Dir, Node } from './DrawGraph';
import { Align } from './DrawGraph';

/**
 * @typedef {object} Node
 * @property {string} id - 节点 id
 * @property {string} name - 节点名称
 * @property {number} [level] - 节点层级
 * @property {{x: number, y: number}} [position] - 节点 x 坐标
 * @property {*} [animation] - 动画
 * @property {Node[]} [children] - 子节点
 *
 */
export default class {
  /**
   * 树形结构数据
   */
  data: Node;
  /**
   * 每层的起始节点
   */
  levelStartNode: number[] = [];
  /**
   * 朝向
   */
  dir: 'TB' | 'LR';
  /**
   * 主轴
   */
  mainAxis: 'x' | 'y';
  /**
   * 次轴
   */
  subAxis: 'x' | 'y';
  /**
   * 对齐方式
   */
  align: Align;
  /**
   * 树形结构的宽高
   */
  size = {
    width: 0,
    height: 0
  };

  constructor(data: Node, dir: Dir = 'TB', align: Align = 'center') {
    this.data = data;
    this.dir = dir;
    this.align = align;

    if (dir === 'TB') {
      this.mainAxis = 'y';
      this.subAxis = 'x';
    } else {
      this.mainAxis = 'x';
      this.subAxis = 'y';
    }
  }

  computeTreeDataCoordinates() {
    this.data.position = { x: 0, y: 0 };
    this.size = { width: 0, height: 0 };
    this.levelStartNode = [];
    this.traverse(this.data);
    return this.size;
  }

  /**
   * 逐层回溯，计算每个节点的坐标
   *
   * @private
   * @param node - 当前节点
   * @param level - 当前层级
   * @returns {number | void} 返回上层新的 y 坐标
   */
  traverse(node: Node, level = 0) {
    const { levelStartNode, mainAxis, subAxis } = this;
    if (!levelStartNode[level]) {
      levelStartNode[level] = 0;
    }
    node.oldPosition = node.oldPosition || node.position;
    // 当前节点位置已经被占据了
    if (levelStartNode[level] > node.position[subAxis]) {
      node.position[subAxis] = levelStartNode[level];
    }
    if (node.children && node.children.length > 0) {
      if (!node.childrenHide) {
        const l = node.children.length;
        for (let i = 0; i < l; i++) {
          const child = node.children[i];
          child.position = {
            [mainAxis]: level + 1,
            // 初始值，如果是第一个子节点，需要根据父节点的位置计算，否则，直接使用上一个子节点的位置 + 1
            [subAxis]: i === 0 ? this.getInitialFirstChildSubAxis(node) : node.children[i - 1].position[subAxis] + 1
          };
          // 父子关联
          child.parent = node;
          this.traverse(child, level + 1);
        }
        node.position[subAxis] = this.getUpdatedParentSubAxis(node);
      } else {
        // 重置子节点位置，以便下次展开时，能够正确计算动画
        this.resetHideChildrenPosition(node);
      }
    }

    levelStartNode[level] = node.position[subAxis] + 1;
    // 动画
    this.handleAnimation(node);

    // 记录最大的宽度和高度
    this.size.width = Math.max(this.size.width, node.position.x + 1);
    this.size.height = Math.max(this.size.height, node.position.y + 1);
  }

  /**
   * 获取初始子节点的第一个子节点的副坐标
   * @param node
   * @returns {number}
   */
  getInitialFirstChildSubAxis(node: Node) {
    const l = node.children!.length;
    const { subAxis } = this;
    switch (this.align) {
      case 'center':
        return node.position[subAxis] - l / 2 + 0.5;
      case 'start':
      default:
        return node.position[subAxis];
    }
  }

  getResetHideChildrenSubAxis(node: Node, i: number) {
    const { subAxis } = this;
    const l = node.children!.length;
    switch (this.align) {
      case 'start':
        return node.position[subAxis] + i;
      case 'center':
      default:
        return node.position[subAxis] - l / 2 + 0.5 + i;
    }
  }

  /**
   * 获取更新后的父节点的副坐标
   * @param node
   * @returns {number}
   */
  getUpdatedParentSubAxis(node: Node) {
    const { subAxis } = this;
    if (!node.children) {
      return node.position[subAxis];
    }
    const l = node.children.length;
    switch (this.align) {
      case 'center':
        return (node.children[0].position[subAxis] + node.children[l - 1].position[subAxis]) / 2;
      case 'start':
        return node.children[0].position[subAxis];
      default:
        return node.children[0].position[subAxis];
    }
  }

  /**
   * 正常来说 GSAP 动画应该在绘制层(DrawGraph)实现，但是我想将子节点切换动画和TreeGraph这个类关联上，所以在这儿实现的
   * 可以自行调整
   */
  handleAnimation(node: Node) {
    const oldPosition = node.oldPosition;
    // 终止之前的动画
    node.animation && node.animation.kill();
    node.animation = null;
    if (oldPosition && (oldPosition.x !== node.position.x || oldPosition.y !== node.position.y)) {
      node.animation = gsap.to(node.oldPosition, {
        ...node.position,
        duration: 0.2,
        onUpdate: () => {
          // 更新节点位置的回调，由绘制层实现
          node.animation?.onUpdate(node.oldPosition);
        }
      });
    }
  }

  /**
   * 重置隐藏子节点的位置
   * @param {Node} node
   */
  resetHideChildrenPosition(node: Node) {
    node.animation && node.animation.kill();
    node.animation = null;
    const children = node.children;
    if (children) {
      const { mainAxis, subAxis } = this;
      const l = children.length;
      for (let i = 0; i < l; i++) {
        const child = children[i];
        child.position = {
          [subAxis]: this.getResetHideChildrenSubAxis(node, i),
          // 可以增加一些风味动画
          // 波浪效果
          [mainAxis]: node.position[mainAxis] + 1 + (l / 2 - i - 0.5) * 0.2
          // y: node.position[mainAxis] + 1,
        };
        child.oldPosition = child.position;
        this.resetHideChildrenPosition(child);
      }
    }
  }
}
