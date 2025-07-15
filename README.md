# Jimeng MCP Server

A Model Context Protocol (MCP) server for Volcengine's Jimeng AI image generation service.

## Features

- Generate images using Volcengine's Jimeng AI service
- Support for Chinese and English prompts
- Configurable image dimensions and generation parameters
- Watermark support
- Built-in prompt enhancement (LLM preprocessing)
- Super-resolution enhancement

## Installation

```bash
npm install jimeng-mcp
```

## Setup

1. Get your Volcengine credentials from the [Volcengine Console](https://console.volcengine.com/)
2. Set environment variables:

```bash
export VOLCENGINE_ACCESS_KEY_ID="your_access_key_id"
export VOLCENGINE_SECRET_ACCESS_KEY="your_secret_access_key"
```

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "jimeng": {
      "command": "npx",
      "args": ["jimeng-mcp"],
      "env": {
        "VOLCENGINE_ACCESS_KEY_ID": "your_access_key_id",
        "VOLCENGINE_SECRET_ACCESS_KEY": "your_secret_access_key"
      }
    }
  }
}
```

### Standalone Usage

```bash
# Set environment variables
export VOLCENGINE_ACCESS_KEY_ID="your_access_key_id"
export VOLCENGINE_SECRET_ACCESS_KEY="your_secret_access_key"

# Run the server
npm start
```

## Available Tools

### `generateImage`

Generate images using text descriptions.

**Parameters:**
- `prompt` (required): Text description for image generation
- `req_key` (optional): Model identifier (default: "jimeng_high_aes_general_v21_L")
- `seed` (optional): Random seed for generation (default: -1)
- `width` (optional): Image width in pixels (default: 512)
- `height` (optional): Image height in pixels (default: 512)
- `use_sr` (optional): Enable super-resolution (default: true)
- `use_pre_llm` (optional): Enable prompt enhancement (default: true)
- `return_url` (optional): Return image URLs (default: true)
- `logo_info` (optional): Watermark configuration

**Example:**
```typescript
{
  "prompt": "一只可爱的小猫在花园里玩耍，阳光明媚，高清摄影",
  "width": 1024,
  "height": 1024,
  "use_sr": true
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode
npm run dev

# Lint
npm run lint

# Format
npm run format
```

## Configuration

### Environment Variables

- `VOLCENGINE_ACCESS_KEY_ID`: Your Volcengine access key ID
- `VOLCENGINE_SECRET_ACCESS_KEY`: Your Volcengine secret access key

### Watermark Configuration

```typescript
{
  "logo_info": {
    "add_logo": true,
    "position": 0,     // 0: bottom-right, 1: bottom-left, 2: top-left, 3: top-right
    "language": 0,     // 0: Chinese, 1: English
    "logo_text_content": "AI Generated",
    "opacity": 0.3
  }
}
```

## API Reference

This MCP server interfaces with Volcengine's Jimeng image generation API. For detailed API documentation, visit:
- [Jimeng API Documentation](https://www.volcengine.com/docs/85621/1537648)
- [Volcengine Authentication](https://www.volcengine.com/docs/6444/1390583)

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues and questions:
- [GitHub Issues](https://github.com/ttkkasd/jimeng-mcp/issues)
- [Volcengine Documentation](https://www.volcengine.com/docs/)

## Security

- Never commit API keys or secrets to version control
- Use environment variables for sensitive configuration
- Regularly rotate your API credentials