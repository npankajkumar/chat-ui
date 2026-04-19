using AI.Backend.Models;
using AI.Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace AI.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly OllamaService _ollamaService;
        private readonly ILogger<ChatController> _logger;

        public ChatController(OllamaService ollamaService, ILogger<ChatController> logger)
        {
            _ollamaService = ollamaService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest("Message cannot be empty.");

            // Check Ollama health
            var isRunning = await _ollamaService.IsOllamaRunningAsync();
            if (!isRunning)
                return StatusCode(503, "Ollama is not running. Start it first.");

            try
            {
                var response = await _ollamaService.SendMessageAsync(request.Message);
                return Ok(new ChatResponse { Response = response });
            }
            catch (TaskCanceledException)
            {
                _logger.LogWarning("Ollama request timed out.");
                return StatusCode(504, "Request timed out. Try pre-loading model with 'ollama run llama3.2'");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error communicating with Ollama.");
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }
    }
}
