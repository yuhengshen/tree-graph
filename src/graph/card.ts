import Konva from 'konva';
import { EventEmitter } from 'events';
import colors from "tailwindcss/colors"
import { Dir, Node, NodeType } from './DrawGraph';


const typeColor: {
  [key in NodeType]: string
} = {
  error: colors.red['500'],
  primary: colors.blue['500'],
  warning: colors.yellow['500'],
  success: colors.green['500']
};

export interface KonvaOption {
  x: number,
  y: number,
  childrenCloseable?: boolean,
  dir: Dir,
}

export class Card extends EventEmitter {
  konvaNode!: Konva.Group;
  konvaOption: KonvaOption;
  dataNode: Node;
  width = 200;
  height = 100;

  // don't execute side effect in constructor, just initialize data
  constructor(dataNode: Node, konvaOption: KonvaOption) {
    super();
    this.dataNode = dataNode;
    this.konvaOption = konvaOption;
  }

  init() {
    this.createCard();
    this.createContent();
    this.createLeftBorder();
    this.createChildrenClose();
    return this;
  }

  createCard() {
    const { x, y } = this.konvaOption;
    const { width, height } = this;
    this.konvaNode = new Konva.Group({
      x,
      y,
      width,
      height
    });
    const react = new Konva.Rect({
      x: 0,
      y: 0,
      width,
      height,
      fill: 'white',
      // top-left bottom-left corner radius = 0
      cornerRadius: [0, 15, 15, 0],
      shadowColor: 'black',
      shadowBlur: 5,
      shadowOffset: { x: 2, y: 2 },
      shadowOpacity: 0.2
    });

    react.on('click', () => {
      this.emit('click:card');
    });

    react.on('mouseover', () => {
      document.body.style.cursor = 'pointer';
    });

    react.on('mouseout', () => {
      document.body.style.cursor = 'default';
    });

    this.konvaNode.add(react);
  }

  createChildrenClose() {
    const { childrenCloseable, dir } = this.konvaOption;
    const { width, height } = this;
    if (!childrenCloseable) return;
    const x = dir === "LR" ? width : width / 2;
    const y = dir === "LR" ? height / 2 : height;
   
    const closeIcon = new Konva.Circle({
      x: x,
      y: y,
      radius: 10,
      fill: '#e5e7eb'
    });
    const getText = () => {
      const { childrenHide } = this.dataNode;
      if (childrenHide) return '➕';
      return '➖';
    };
    const text = new Konva.Text({
      x: x - 10,
      y: y - 10,
      width: 20,
      height: 20,
      text: getText(),
      fontSize: 12,
      align: 'center',
      verticalAlign: 'middle',
      listening: false
    });

    closeIcon.on('click', (ev) => {
      ev.cancelBubble = true;
      this.emit('click:toggle');
      text.text(getText());
    });

    this.konvaNode.add(closeIcon, text);
  }

  createLeftBorder() {
    const { height } = this;
    const { type } = this.dataNode;
    if (!type) return;
    const color = typeColor[type];
    const errorBorder = new Konva.Rect({
      x: 0,
      y: 0,
      width: 5,
      height,
      fill: color,
      listening: false
    });
    this.konvaNode.add(errorBorder);
  }

  createPersonInfo() {
    const { avatar, name, deptName } = this.dataNode;
    if (avatar) {
      const image = new Image();
      image.src = avatar;
      image.onload = () => {
        const avatar = new Konva.Circle({
          x: 30,
          y: 30,
          radius: 20,
          stroke: colors.gray['200'],
          strokeWidth: 2,
          fillPatternImage: image,
          fillPatternOffset: { x: 60, y: 60 },
          fillPatternScale: { x: 1 / 3, y: 1 / 3 },
          listening: false
        });
        this.konvaNode.add(avatar);
      };
    }

    const text = new Konva.Text({
      x: 60,
      y: 20,
      width: 120,
      height: 30,
      text: `${name} (${deptName})`,
      align: 'left',
      verticalAlign: 'middle',
      fontSize: 12,
      listening: false
    });
    this.konvaNode.add(text);
  }

  /**
   * @abstract
   */
  createContent() {
    throw new Error('Not implemented');
  }
}

export class PersonCard extends Card {
  createContent() {
    this.createPersonInfo();

    const { x, y } = this.konvaOption;
    const { width, height } = this;
    let { targetCount, isStar } = this.dataNode;
    const targetText = new Konva.Text({
      x: 60,
      y: 50,
      width: 120,
      height: 30,
      text: `🎯目标数：${targetCount}`,
      align: 'left',
      verticalAlign: 'middle',
      fontSize: 12,
      fill: colors.gray['500'],
      listening: false
    });

    const star = new Konva.Star({
      x: 30,
      y: 70,
      numPoints: 5,
      innerRadius: 7,
      outerRadius: 10,
      fill: isStar ? colors.yellow['500'] : 'white',
      stroke: colors.yellow['500'],
      strokeWidth: 2
    });

    star.on('click', (ev) => {
      ev.cancelBubble = true;
      this.emit('click:star');
      this.dataNode.isStar = isStar = !isStar;
      star.fill(isStar ? colors.yellow['500'] : 'white');
    });

    this.konvaNode.add(targetText, star);
  }
}

export class TargetCard extends Card {
  createContent() {
    const { name, progress } = this.dataNode;
    const { width, height } = this;
    const text = new Konva.Text({
      x: 20,
      y: 25,
      text: '🎯' + name + ' (2022/12/01)',
      fontSize: 14,
      align: 'left',
      verticalAlign: 'middle',
      listening: false
    });
    const text2 = new Konva.Text({
      x: 20,
      y: 50,
      text: `关联: @1 @2 @3 @4\n来自: @4 @5 @6`,
      align: 'left',
      verticalAlign: 'middle',
      lineHeight: 1.5,
      textDecoration: 'underline',
      fill: colors.gray['500'],
      listening: false
    });

    if (progress) {
      const r = 15;
      const l = 2 * Math.PI * r;
      const circleProgress = new Konva.Circle({
        x: width - r * 2,
        y: height / 2,
        radius: r,
        stroke: typeColor.primary,
        strokeWidth: 2,
        fill: 'white',
        // 环形进度条
        dash: [l, l],
        dashOffset: l * (1 - progress / 100),
        dashEnabled: true,
        listening: false
      });

      const progressText = new Konva.Text({
        x: width - r * 2 - 12,
        y: height / 2 - 6,
        text: `${progress}%`,
        align: 'center',
        verticalAlign: 'middle',
        fill: '#6b7280',
        fontSize: 12,
        listening: false
      });
      this.konvaNode.add(circleProgress, progressText);
    }
    this.konvaNode.add(text, text2);
  }
}

export class TaskCard extends Card {
  width = 230;
  height = 100;

  createContent() {
    this.createPersonInfo();

    const { taskDesc, taskDate, relation } = this.dataNode;

    const text = new Konva.Text({
      x: 20,
      y: 50,
      text: `🎯${taskDesc} (${taskDate})`,
      align: 'left',
      verticalAlign: 'middle',
      lineHeight: 1.5,
      listening: false
    });

    if (relation) {
      const relationText = new Konva.Text({
        x: 20,
        y: 70,
        text: `关联: @${relation}`,
        align: 'left',
        verticalAlign: 'middle',
        lineHeight: 1.5,
        textDecoration: 'underline',
        fill: colors.gray['500'],
        listening: false
      });
      this.konvaNode.add(relationText);
    }

    this.konvaNode.add(text);
  }
}

export function createCard(node: Node, konvaOption: KonvaOption) {
  const { cardType } = node;
  const CardClass: typeof Card = cardType ? {
    person: PersonCard,
    target: TargetCard,
    task: TaskCard
  }[cardType] : PersonCard;
  return new CardClass(node, konvaOption).init();
}
