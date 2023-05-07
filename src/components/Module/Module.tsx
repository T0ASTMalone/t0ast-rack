import { useEffect, useMemo, useState } from 'react';
import { Play, Stop, X, Activity } from 'phosphor-react';
import { motion } from 'framer-motion';

import { RackNode, RackModuleUIProps, RackAudioNode } from '../../types/RackTypes';

import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { ModuleVisualizer } from '../ModuleVisualizer';
import { ModuleIO } from '../ModuleIO';
import { ModuleParam } from '../ModuleParam';

import useRackApi, { useRemoveModule } from '../../hooks/useRackApi';

import './Module.css';

const fadeIn = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
};

const fadeOut = {
  rest: { opacity: 1 },
  hover: { opacity: 0 },
}

export function Value({ node }: { node: RackNode<any> }) {
  const [val, setVal] = useState();

  useEffect(() => {
    if (node) {
      node.onValueUpdate((val: any) => setVal(val));
    }
  }, [node]);

  return <span>{val}</span>
}

function Module<T extends RackAudioNode>({ node, children }: RackModuleUIProps<T>) {
  const [visualizer, setVisualizer] = useState<boolean>(false);
  const isDestination = useMemo(() => node.name === 'Destination', [node.name]);
  const { 
    id, 
    started,
    inputs,
    outputs,
    params,
    handleUpdateParam,
    handleAddMainInput,
    handleStartNode, 
    handleParamClick, 
    handleAddMainOutput, 
  } = useRackApi(node);

  const removeModule = useRemoveModule();

  const handleToggleVisualizer = () => {
    setVisualizer((state: boolean) => !state);
  };

  return (
    <motion.div initial="rest" whileHover="hover" className={`module ${isDestination ? 'destination' : ''}`}>
      <div className="module__header">
        <motion.div variants={fadeIn} className="module__controls">
          {node.name !== 'Destination' && (
            <button
              onClick={() => removeModule(node.id)}
              className="module__io-button"
              variants={fadeIn}
            >
              <X width={20} height={20}/>
            </button>
          )}
          {node.analyzer && (
            <button 
              className={`module__io-button ${visualizer ? 'active' : ''}`}
              onClick={handleToggleVisualizer}
            >
              <Activity
                color={visualizer ? "#646cff" : "white"}
                size={20} 
              />
            </button>
          )}
          {node.name !== 'Destination' && (
            <button
              className="module__io-button"
              onClick={handleStartNode}
            >
              {started ? (
                <Stop size={20} />
              ) : (
                <Play size={20} />
              )}
            </button>
          )} 
        </motion.div>
        <motion.h3 
          variants={node.name !== 'Destination' ? fadeOut : null}
          className="module__io-name"
        >
          {node.name}
        </motion.h3>
      </div>
      <OverlayScrollbarsComponent 
        options={{ scrollbars: { autoHide: 'scroll' } }} 
        style={{ maxHeight: "calc(100% - 22px)", marginTop: '22px'  }}
        defer
      >
        <div className="module__scroll-container">
          {node.analyzer && <ModuleVisualizer analyzer={node.analyzer} visible={visualizer} />}
          <Value node={node} />
          {/* <h3 className="module__io-name">{node.name}</h3> */}
          <div className="module__io">
            {/* Main in */}
            <ModuleIO
              // either the one set by the init fn on the RackNode 
              // or the default set by the AudioNode or
              // nothing
              count={node?.numberOfInputs ?? node.node?.numberOfInputs ?? 0}
              label="in"
              name="main"
              onClick={handleAddMainInput}
              outputs={inputs?.main}
            /> 
            {/* Main out */}
            <ModuleIO
              count={node?.numberOfOutputs ?? node.node?.numberOfOutputs ?? 0}
              label="out"
              name="main"
              onClick={handleAddMainOutput}
              outputs={outputs?.main}
            /> 
          </div>
          {children}
          {params && params.length > 0 && ( 
            <div className="module__params">
              {params.map(([name, param], i) => (
                <ModuleParam
                  key={`${id}-${param}-${i}`}
                  onChange={handleUpdateParam}
                  name={name}
                  param={param}
                  value={param?.value}
                  types={node?.paramOptions?.type?.values}
                  nodeId={node.id}
                  input={inputs
                    ? inputs[name] 
                    : undefined
                  }
                  onClick={handleParamClick}
                  options={node?.paramOptions?.[name]}
                />
              ))}
            </div>
          )}
        </div>
      </OverlayScrollbarsComponent>
    </motion.div>
  );
}

export default Module;

