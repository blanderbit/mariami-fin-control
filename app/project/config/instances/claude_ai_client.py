from typing import Optional, List, Dict
import logging

from django.conf import settings
import anthropic

logger = logging.getLogger(__name__)


class ClaudeClient:
    """Singleton Claude client"""

    _instance: Optional["ClaudeClient"] = None
    _client: Optional[anthropic.Anthropic] = None
    _initialized: bool = False

    def __new__(cls) -> "ClaudeClient":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        # Don't initialize immediately, wait for first access
        pass

    def _initialize_client(self):
        """Initialize Claude client"""
        if self._initialized:
            return

        try:
            # Get API key from settings
            api_key = getattr(settings, 'CLAUDE_API_KEY', None)
            if not api_key:
                raise ValueError("CLAUDE_API_KEY not found in settings")

            # Initialize the client
            self._client = anthropic.Anthropic(api_key=api_key)
            self._initialized = True
            logger.info("Claude client initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Claude client: {str(e)}")
            raise

    @property
    def client(self) -> anthropic.Anthropic:
        """Get the Claude client, initializing if necessary"""
        if not self._initialized:
            self._initialize_client()
        
        if self._client is None:
            raise RuntimeError("Claude client failed to initialize")
            
        return self._client

    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "claude-sonnet-4-20250514",
        max_tokens: int = 1000,
        temperature: float = 0.7,
        system: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Generate chat completion using Claude API
        
        Args:
            messages: List of message dictionaries (user/assistant only)
            model: Claude model to use
            max_tokens: Maximum tokens in response
            temperature: Creativity/randomness (0-1)
            system: System prompt (separate parameter for Claude)
            **kwargs: Additional parameters for Claude API
            
        Returns:
            Generated text content
        """
        try:
            # Extract system message and convert to Claude format
            claude_messages, system_prompt = self._convert_to_claude_format(messages, system)
            
            # Prepare API call parameters
            api_params = {
                "model": model,
                "messages": claude_messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
                **kwargs
            }
            
            # Add system prompt if provided
            if system_prompt:
                api_params["system"] = system_prompt
            
            response = self.client.messages.create(**api_params)
            
            return response.content[0].text.strip()
            
        except Exception as e:
            logger.error(f"Claude chat completion failed: {str(e)}")
            raise

    def _convert_to_claude_format(self, messages: List[Dict[str, str]], system: Optional[str] = None) -> tuple:
        """Convert OpenAI format messages to Claude format"""
        claude_messages = []
        system_prompt = system
        
        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            
            if role == 'system':
                # System messages go to system parameter in Claude
                if system_prompt:
                    system_prompt = f"{system_prompt}\n\n{content}"
                else:
                    system_prompt = content
            elif role in ['user', 'assistant']:
                # Only user and assistant messages go to messages array
                claude_messages.append({'role': role, 'content': content})
            else:
                logger.warning(f"Unknown message role: {role}, treating as user")
                claude_messages.append({'role': 'user', 'content': content})
        
        # Ensure conversation starts with user message
        if claude_messages and claude_messages[0]['role'] != 'user':
            logger.warning("Claude conversation must start with user message")
            claude_messages.insert(0, {'role': 'user', 'content': 'Please help me with the following:'})
                
        return claude_messages, system_prompt

    def is_available(self) -> bool:
        """Check if Claude client is properly initialized and available"""
        try:
            return self._initialized and self._client is not None
        except Exception:
            return False


# Create singleton instance - use Claude naming
CLAUDE_CLIENT = ClaudeClient()