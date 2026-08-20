/**
 * @file: 多模态入口
 * @description: 导出多模态处理系统
 * @module @family-pai/core/multimodal
 * @author: YanYuCloudCube Team

 * @updated: 2026-04-30
 * @version: v1.0.0
 * @created: 2026-04-30
 * @status: active
 * @tags: [multimodal] */

export { MultimodalManager, type MultimodalEvents } from './manager.js'
export { ImageProcessor } from './image-processor.js'
export { AudioProcessor, type AudioProcessorConfig } from './audio-processor.js'
export { DocumentProcessor } from './document-processor.js'
export type {
  MultimodalType,
  ImageFormat,
  AudioFormat,
  DocumentFormat,
  VideoFormat,
  MultimodalInput,
  ImageInput,
  AudioInput,
  DocumentInput,
  VideoInput,
  ImageAnalysisOptions,
  ImageAnalysisTask,
  ImageAnalysisResult,
  AudioTranscriptionOptions,
  AudioTranscriptionResult,
  TextToSpeechOptions,
  TextToSpeechResult,
  DocumentParseOptions,
  DocumentParseResult,
  MultimodalResult,
  MultimodalProcessorConfig,
} from './types.js'
