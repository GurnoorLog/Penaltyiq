# Models

Place compiled BitNet.cpp binary and weights here.

## Setup

1. Clone https://github.com/microsoft/BitNet
2. Build following their instructions
3. Place the compiled binary in this directory
4. Download or convert model weights and place them here
5. Run: `./bitnet.cpp --model <path-to-weights> --port 8080`

## Environment Variables

- `BITNET_ENDPOINT`: Default `http://127.0.0.1:8080`
- `INFERENCE_BACKEND`: Set to `bitnet` (default) or `llamacpp` for llama.cpp fallback
