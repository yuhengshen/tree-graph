import { useEffect, useRef, useState } from "react";
import mockData from "./graph/mockData";
import { DrawGraph } from "./graph/DrawGraph";
import { createCard } from "./graph/card";

function App() {
  const container = useRef(null);
  const [instance, setInstance] = useState<DrawGraph>();

  useEffect(() => {
    const instance = new DrawGraph(
      container.current!,
      {
        padding: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        },
        distance: {
          x: 300,
          y: 150,
        },
        createCard,
        // start or center
        align: 'start',
        // LR or TB
        dir: 'LR',
        events: {
          "click:star": (node) => {
            const { name } = node;
            alert(`点击了[${name}]star`);
          },
        },
      },
      structuredClone(mockData)
    ).draw();
    setInstance(instance);
    return () => {
      instance.destroy();
    };
  }, []);

  return (
    <div>
      <div>
        <select
          onInput={(e) => {
            // @ts-ignore
            const v = e.target.value;
            instance?.setAlign(v as any);
          }}
        >
          <option value="start">start</option>
          <option value="center">center</option>
        </select>
      </div>
      <div ref={container} className="will-change"></div>
    </div>
  );
}

export default App;
