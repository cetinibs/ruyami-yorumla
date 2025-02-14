import { HfInference } from '@huggingface/inference';

if (!process.env.HUGGINGFACE_API_KEY) {
  console.warn('HUGGINGFACE_API_KEY is not defined, using default model');
}

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export default hf;
