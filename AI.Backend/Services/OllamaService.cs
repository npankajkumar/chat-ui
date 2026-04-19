using System.Text.Json;
using System.Text;
using AI.Backend.Models;

namespace AI.Backend.Services
{
    public class OllamaService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<OllamaService> _logger;

        public OllamaService(IHttpClientFactory httpClientFactory, ILogger<OllamaService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        // Health check — is Ollama running?
        public async Task<bool> IsOllamaRunningAsync()
        {
            try
            {
                var client = _httpClientFactory.CreateClient("Ollama");
                var response = await client.GetAsync("/");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        // Send message to Ollama and get response
        public async Task<string> SendMessageAsync(string message)
        {
            var client = _httpClientFactory.CreateClient("Ollama");

            var ollamaRequest = new
            {
                model = "llama3.2",
                prompt = message,
                stream = false,
                options = new
                {
                    num_predict = 500,
                    temperature = 0.7
                }
            };

            var content = new StringContent(
                JsonSerializer.Serialize(ollamaRequest),
                Encoding.UTF8,
                "application/json"
            );

            using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(5));

            _logger.LogInformation("Sending message to Ollama: {Message}", message);

            var response = await client.PostAsync("/api/generate", content, cts.Token);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError("Ollama returned error: {Error}", error);
                throw new Exception($"Ollama error: {error}");
            }

            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<OllamaResponse>(responseString);

            return result?.response ?? "No response from model.";
        }
    }
}
