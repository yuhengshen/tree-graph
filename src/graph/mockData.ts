import { Node } from "./DrawGraph";

const data: Node = {
  name: 'A',
  deptName: '部门A',
  targetCount: 3,
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  children: [
    {
      name: 'AA',
      cardType: 'target',
      progress: 50,
      type: 'success',
      children: [
        {
          name: 'AAA',
          deptName: '部门AA',
          cardType: 'task',
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
          type: 'error',
          taskDesc: '完成10万的销售额',
          taskDate: '2020-01-01',
          relation: '张三',
          children: [
            {
              type: 'error',
              name: 'AAAA',
              deptName: '部门AA',
              cardType: 'task',
              avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
              taskDesc: '完成8万的销售额',
              taskDate: '2020-01-01'
            },
            {
              name: 'AAAB',
              deptName: '部门AA',
              cardType: 'task',
              avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
              taskDesc: '完成2万的销售额',
              taskDate: '2020-01-01'
            }
          ]
        },
        {
          name: 'AAB',
          type: 'warning',
          deptName: '部门AA',
          cardType: 'task',
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
          taskDesc: '完成10万的销售额',
          taskDate: '2020-01-01',
          children: [
            {
              name: 'AABA',
              type: 'success',
              cardType: 'target'
            }
          ]
        }
      ]
    },
    {
      name: 'AB',
      type: 'success',
      cardType: 'target',
      progress: 32,
      children: [
        {
          type: 'success',
          name: 'ABA',
          deptName: '部门AA',
          cardType: 'task',
          taskDesc: '完成10万的销售额',
          taskDate: '2020-01-01',
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
        },
        {
          type: 'success',
          name: 'ABB',
          deptName: '部门AA',
          cardType: 'task',
          taskDesc: '完成10万的销售额',
          taskDate: '2020-01-01',
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
        }
      ]
    },
    {
      progress: 1,
      name: 'AC',
      cardType: 'target',
      children: [
        {
          progress: 1,
          name: 'ACA',
          cardType: 'task',
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
          deptName: '部门A',
          taskDesc: '完成10万的销售额',
          taskDate: '2020-01-01',
        }
      ]
    },
    {
      progress: 99,
      name: 'AD',
      cardType: 'target'
    }
  ]
};

export default data;