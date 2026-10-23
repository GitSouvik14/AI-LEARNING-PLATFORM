import React, { useState } from 'react';
import { InteractiveSandboxConfig } from '../data/courses';
import { Play, RotateCcw, Sparkles, Sliders, Eye, TrendingDown } from 'lucide-react';

interface InteractiveSandboxProps {
  config: InteractiveSandboxConfig;
}

export const InteractiveSandbox: React.FC<InteractiveSandboxProps> = ({ config }) => {
  // Classifier state
  const [weight, setWeight] = useState(config.initialState.weight || 150);
  const [hue, setHue] = useState(config.initialState.colorHue || 40);
  const [threshold, setThreshold] = useState(config.initialState.threshold || 140);

  // Neuron weight state
  const [w1, setW1] = useState(config.initialState.w1 || 0.8);
  const [w2, setW2] = useState(config.initialState.w2 || -0.4);
  const [bias, setBias] = useState(config.initialState.bias || 0.2);
  const target = 1.0;

  // Token state
  const [inputText, setInputText] = useState(
    config.initialState.text || 'Artificial Intelligence empowers learners worldwide.'
  );

  // Vision kernel state
  const [kernelType, setKernelType] = useState(config.initialState.filter || 'edge');

  // Render Classifier
  if (config.type === 'classifier') {
    // Model prediction score: linear combination
    const score = weight * 0.7 + hue * 0.5;
    const isOrange = score >= threshold;
    const confidence = Math.min(99, Math.round(50 + Math.abs(score - threshold) * 0.4));

    return (
      <div className="rounded-2xl bg-slate-900 border border-cyan-800/50 p-5 text-slate-100 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">{config.title}</h4>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-300">
            Interactive ML Sandbox
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2 mb-4">{config.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Fruit Weight (Feature X1):</span>
                <span className="font-mono text-cyan-300">{weight}g</span>
              </div>
              <input
                type="range"
                min="80"
                max="240"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Color Sweetness Hue (Feature X2):</span>
                <span className="font-mono text-cyan-300">{hue}°</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={hue}
                onChange={(e) => setHue(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Model Decision Threshold:</span>
                <span className="font-mono text-purple-300">{threshold}</span>
              </div>
              <input
                type="range"
                min="90"
                max="190"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Classification result box */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-4xl mb-2">{isOrange ? '🍊' : '🍎'}</div>
            <div className="text-base font-bold text-white">
              Predicted: {isOrange ? 'Orange' : 'Apple'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Confidence: <span className="font-bold text-cyan-400">{confidence}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full transition-all duration-300 ${isOrange ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${confidence}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-2 font-mono">
              Score: {score.toFixed(1)} vs Threshold: {threshold}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Neuron Weights & Loss
  if (config.type === 'weights') {
    const x1 = 1.0;
    const x2 = 0.5;
    const rawSum = w1 * x1 + w2 * x2 + bias;
    const activatedOutput = Math.max(0, rawSum); // ReLU
    const loss = Math.pow(target - activatedOutput, 2); // MSE

    const handleGradientStep = () => {
      // Step downhill towards target output
      const error = activatedOutput - target;
      const lr = 0.15;
      setW1((prev: number) => parseFloat((prev - lr * error * x1).toFixed(2)));
      setW2((prev: number) => parseFloat((prev - lr * error * x2).toFixed(2)));
      setBias((prev: number) => parseFloat((prev - lr * error).toFixed(2)));
    };

    return (
      <div className="rounded-2xl bg-slate-900 border border-purple-800/50 p-5 text-slate-100 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-bold text-white">{config.title}</h4>
          </div>
          <button
            onClick={handleGradientStep}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Take Gradient Step</span>
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 mb-4">{config.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Weight 1 (W1):</span>
                <span className="font-mono text-purple-300">{w1}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.05"
                value={w1}
                onChange={(e) => setW1(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Weight 2 (W2):</span>
                <span className="font-mono text-purple-300">{w2}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.05"
                value={w2}
                onChange={(e) => setW2(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Neuron Bias (b):</span>
                <span className="font-mono text-cyan-300">{bias}</span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={bias}
                onChange={(e) => setBias(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Inputs [x1=1, x2=0.5]:</span>
              <span className="font-mono text-slate-200">Linear Sum = {rawSum.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">ReLU Output (max(0, sum)):</span>
              <span className="font-mono font-bold text-cyan-400">{activatedOutput.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Target Value:</span>
              <span className="font-mono text-slate-300">{target.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300">Loss (MSE Error):</span>
              <span
                className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                  loss < 0.05 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {loss.toFixed(4)}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              Goal: Minimize loss to near 0.0000. Click "Take Gradient Step" or adjust dials!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Tokenizer & Attention
  if (config.type === 'tokens') {
    const tokens = inputText.split(/\s+/).filter(Boolean);

    return (
      <div className="rounded-2xl bg-slate-900 border border-cyan-800/50 p-5 text-slate-100 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h4 className="text-sm font-bold text-white">{config.title}</h4>
        </div>
        <p className="text-xs text-slate-400 mt-2 mb-3">{config.description}</p>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type any sentence to see tokens..."
          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 mb-3"
        />

        <div className="text-xs font-bold text-slate-300 mb-2">Token Fragments &amp; IDs:</div>
        <div className="flex flex-wrap gap-2">
          {tokens.map((token: string, idx: number) => {
            const tokenColors = [
              'bg-blue-950 text-blue-300 border-blue-700/60',
              'bg-purple-950 text-purple-300 border-purple-700/60',
              'bg-emerald-950 text-emerald-300 border-emerald-700/60',
              'bg-amber-950 text-amber-300 border-amber-700/60',
            ];
            const colorClass = tokenColors[idx % tokenColors.length];
            return (
              <div
                key={idx}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 shadow-sm ${colorClass}`}
              >
                <span className="font-sans font-semibold">"{token}"</span>
                <span className="text-[9px] opacity-70">#{1024 + idx * 73}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render Convolution Filter Sandbox
  if (config.type === 'vision_kernel') {
    return (
      <div className="rounded-2xl bg-slate-900 border border-emerald-800/50 p-5 text-slate-100 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">{config.title}</h4>
          </div>
          <div className="flex gap-1.5">
            {['edge', 'sharpen', 'blur'].map((f) => (
              <button
                key={f}
                onClick={() => setKernelType(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize border transition ${
                  kernelType === f
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2 mb-4">{config.description}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-xs font-bold text-slate-400 mb-2">3x3 Kernel Matrix:</div>
            <div className="inline-grid grid-cols-3 gap-1 font-mono text-xs text-emerald-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
              {kernelType === 'edge' ? (
                <>
                  <span className="p-1">-1</span>
                  <span className="p-1">-1</span>
                  <span className="p-1">-1</span>
                  <span className="p-1">-1</span>
                  <span className="p-1 bg-emerald-950 font-bold">8</span>
                  <span className="p-1">-1</span>
                  <span className="p-1">-1</span>
                  <span className="p-1">-1</span>
                  <span className="p-1">-1</span>
                </>
              ) : kernelType === 'sharpen' ? (
                <>
                  <span className="p-1">0</span>
                  <span className="p-1">-1</span>
                  <span className="p-1">0</span>
                  <span className="p-1">-1</span>
                  <span className="p-1 bg-emerald-950 font-bold">5</span>
                  <span className="p-1">-1</span>
                  <span className="p-1">0</span>
                  <span className="p-1">-1</span>
                  <span className="p-1">0</span>
                </>
              ) : (
                <>
                  <span className="p-1">0.1</span>
                  <span className="p-1">0.1</span>
                  <span className="p-1">0.1</span>
                  <span className="p-1">0.1</span>
                  <span className="p-1 bg-emerald-950 font-bold">0.2</span>
                  <span className="p-1">0.1</span>
                  <span className="p-1">0.1</span>
                  <span className="p-1">0.1</span>
                  <span className="p-1">0.1</span>
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center flex flex-col justify-center">
            <div className="text-xs font-bold text-slate-400 mb-1">Visual Effect Detected:</div>
            <div className="text-sm font-bold text-white capitalize">
              {kernelType === 'edge'
                ? 'High-Contrast Edges & Outlines'
                : kernelType === 'sharpen'
                ? 'Enhanced Local Contrast'
                : 'Gaussian Pixel Averaging'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Convolutions allow CNNs to detect horizontal and vertical lines regardless of where
              they appear in the image!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
