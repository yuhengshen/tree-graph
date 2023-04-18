import Konva from 'konva';
import TreeGraph from './TreeGraph';
import colors from 'tailwindcss/colors';
import { KonvaOption } from "./card";


export type NodeType = "error" | "primary" | "warning" | "success";
export type CardType = "task" | "target" | 'person';

export interface Node {
  [key: string]: any;
  children?: Node[],
  type?: NodeType,
  cardType?: CardType
}

export type Align = 'center' | 'start';

export type Dir = 'LR' | 'TB';

interface DrawGraphOptions {
  padding: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  },
  distance: {
    x: number;
    y: number;
  },
  createCard: (nodeOptions: Node, konvaOptions: KonvaOption) => any,
  dir: Dir,
  align: Align,
  events: {
    [eventName: string]: (node: Node) => void
  }
}

export class DrawGraph {

  stage: Konva.Stage;
  layer: Konva.Layer;
  lineLayer: Konva.Layer;
  options: DrawGraphOptions;
  treeGraph: TreeGraph;
  scale: number = 1;


  constructor(container: HTMLDivElement | string, options: DrawGraphOptions, data: Node) {
    this.options = options;
    this.stage = new Konva.Stage({
      container
    });
    this.layer = new Konva.Layer();
    this.lineLayer = new Konva.Layer({ listening: false });
    this.stage.add(this.lineLayer);
    this.stage.add(this.layer);
    this.treeGraph = new TreeGraph(data, options.dir, options.align);
  }

  draw() {
    // 计算树形结构的坐标
    this.treeGraph.computeTreeDataCoordinates();
    // 设置舞台大小
    this.setStageSize();
    this.traverse(this.treeGraph.data);
    return this;
  }

  /**
   * 设置舞台大小
   *
   * ! 这是一个长任务，需要避免频繁调用，如：需要对视图进行缩放时，需要节流
   * @private
   */
  setStageSize() {
    const size = this.treeGraph.size;
    const { scale, stage, options } = this;
    const { distance, padding } = options;
    const { x: dx, y: dy } = distance;
    const { width, height } = size;
    stage.width((width * dx + padding.left + padding.right) * scale);
    stage.height((height * dy + padding.top + padding.bottom) * scale);
    stage.scale({ x: scale, y: scale });
  }

  /**
   * 遍历树形结构，绘制节点
   * 
   * @private
   * @param node
   */
  traverse(node: Node) {
    const { layer, lineLayer, options } = this;
    const { distance, padding, createCard, events } = options;
    const { x: dx, y: dy } = distance;
    const { oldPosition, children, parent } = node;
    const card = createCard(node, {
      x: oldPosition.x * dx + padding.left,
      y: oldPosition.y * dy + padding.top,
      childrenCloseable: node.children && node.children.length > 0,
      dir: options.dir,
    });
    const group = card.konvaNode;
    // 绑定事件，切换子节点的显示状态，触发动画
    card.on('click:toggle', () => {
      node.childrenHide = !node.childrenHide;
      this.animate();
    });


    // 其他事件
    if (events) {
      Object.keys(events).forEach((eventName) => {
        card.on(eventName, () => {
          events[eventName](node);
        });
      });
    }

    node.konvaNode = group;

    // 绘制连接线
    if (parent) {
      const points = this.getLinePoints(parent.konvaNode, node.konvaNode);
      const line = new Konva.Line({
        points: points,
        stroke: colors.gray[200],
        strokeWidth: 1
      });
      lineLayer.add(line);
      node.line = line;
    }

    layer.add(group);
    children && children.forEach(this.traverse.bind(this));
  }

  animate() {
    // 再次计算树形结构的坐标
    this.treeGraph.computeTreeDataCoordinates();
    // 设置舞台大小
    this.setStageSize();
    const { treeGraph, options } = this;
    const { distance, padding } = options;
    const { x: dx, y: dy } = distance;
    // 避免重复绘制
    const updatedLines = new Set();
    const dfs = (node: Node, hide: boolean) => {
      const { children, parent, animation } = node;
      const group = node.konvaNode;
      const line = node.line;
      if (hide) {
        group.hide();
        line && line.hide();
      } else {
        group.show();
        line && line.show();
      }
      children && children.forEach((child) => dfs(child, hide || node.childrenHide));
      if (animation) {
        animation.onUpdate = (e: {x: number, y: number}) => {
          group.setPosition({
            x: e.x * dx + padding.left,
            y: e.y * dy + padding.top
          });

          // 在下一个tick绘制线条，避免线条绘制不齐
          setTimeout(() => {
            // 父线条
            if (line && !updatedLines.has(line)) {
              const points = this.getLinePoints(parent.konvaNode, node.konvaNode);
              line.points(points);
            }
            // 子线条
            if (children) {
              children.forEach((child) => {
                const childLine = child.line;
                if (childLine) {
                  const points = this.getLinePoints(node.konvaNode, child.konvaNode);
                  childLine.points(points);
                  updatedLines.add(childLine);
                }
              });
            }
          }, 0);
        };
      }
    };
    dfs(treeGraph.data, false);
  }

  setAlign(align: Align) {
    this.options.align = align;
    this.treeGraph.align = align;
    this.animate();
  }

  setScale(scale: number) {
    this.scale = scale;
    this.setStageSize();
  }

  getLinePoints(parentKonvaNode: any, childKonvaNode: any) {
    const { dir } = this.options;
    let x1;
    let x2;
    let y1;
    let y2;
    if (dir === 'LR') {
      x1 = parentKonvaNode.x() + parentKonvaNode.width();
      y1 = parentKonvaNode.y() + parentKonvaNode.height() / 2;

      x2 = childKonvaNode.x();
      y2 = childKonvaNode.y() + childKonvaNode.height() / 2;
      return [x1, y1, (x1 + x2) / 2, y1, (x1 + x2) / 2, y2, x2, y2];
    } else {
      x1 = parentKonvaNode.x() + parentKonvaNode.width() / 2;
      y1 = parentKonvaNode.y() + parentKonvaNode.height();

      x2 = childKonvaNode.x() + childKonvaNode.width() / 2;
      y2 = childKonvaNode.y();
      return [x1, y1, x1, (y1 + y2) / 2, x2, (y1 + y2) / 2, x2, y2];
    }
  }

  destroy() {
    this.stage.destroy();
  }

  downloadImg(name = '树状图') {
    const dataURL = this.stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `${name}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return this;
  }
}
