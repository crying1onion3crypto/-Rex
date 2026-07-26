"""
AI Service Implementation
"""

import logging
import re
import asyncio
from typing import Optional, List, Dict, Any, Tuple
from pathlib import Path

import httpx
from pydantic import BaseModel

from app.config import settings
from app.models.analysis import (
    RiskFlag,
    ExtractedClause,
    MissingClause,
    ContractSummary,
    RiskAnalysis,
)

logger = logging.getLogger(__name__)


class AIProvider:
    """Base AI Provider class"""
    
    def __init__(self, name: str, api_key: Optional[str] = None):
        self.name = name
        self.api_key = api_key
        self.base_url = self.get_base_url()
    
    def get_base_url(self) -> str:
        """Get base URL for the provider"""
        urls = {
            "deepseek": "https://api.deepseek.com/v1",
            "openai": "https://api.openai.com/v1",
        }
        return urls.get(self.name, "https://api.openai.com/v1")
    
    async def chat_completion(
        self,
        messages: List[Dict[str, Any]],
        model: str = "gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: int = 4000,
    ) -> Dict[str, Any]:
        """Send chat completion request"""
        raise NotImplementedError("chat_completion must be implemented by subclass")


class DeepSeekProvider(AIProvider):
    """DeepSeek AI Provider"""
    
    def __init__(self, api_key: str):
        super().__init__("deepseek", api_key)
    
    async def chat_completion(
        self,
        messages: List[Dict[str, Any]],
        model: str = "deepseek-chat",
        temperature: float = 0.7,
        max_tokens: int = 4000,
    ) -> Dict[str, Any]:
        """Send chat completion request to DeepSeek"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        
        try:
            async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                
                response.raise_for_status()
                return response.json()
                
        except httpx.HTTPStatusError as e:
            logger.error(f"DeepSeek API error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"DeepSeek API request failed: {e}")
            raise


class OpenAIProvider(AIProvider):
    """OpenAI Provider"""
    
    def __init__(self, api_key: str):
        super().__init__("openai", api_key)
    
    async def chat_completion(
        self,
        messages: List[Dict[str, Any]],
        model: str = "gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: int = 4000,
    ) -> Dict[str, Any]:
        """Send chat completion request to OpenAI"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        
        try:
            async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                
                response.raise_for_status()
                return response.json()
                
        except httpx.HTTPStatusError as e:
            logger.error(f"OpenAI API error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"OpenAI API request failed: {e}")
            raise


def get_ai_provider() -> AIProvider:
    """Get the appropriate AI provider based on configuration"""
    primary_provider = settings.AI_PROVIDER.lower()
    fallback_provider = settings.AI_FALLBACK_PROVIDER.lower()
    
    # Try primary provider first
    if primary_provider == "deepseek" and settings.DEEPSEEK_API_KEY:
        return DeepSeekProvider(settings.DEEPSEEK_API_KEY)
    elif primary_provider == "openai" and settings.OPENAI_API_KEY:
        return OpenAIProvider(settings.OPENAI_API_KEY)
    
    # Try fallback provider
    if fallback_provider == "deepseek" and settings.DEEPSEEK_API_KEY:
        return DeepSeekProvider(settings.DEEPSEEK_API_KEY)
    elif fallback_provider == "openai" and settings.OPENAI_API_KEY:
        return OpenAIProvider(settings.OPENAI_API_KEY)
    
    # Default to OpenAI if available
    if settings.OPENAI_API_KEY:
        return OpenAIProvider(settings.OPENAI_API_KEY)
    
    raise ValueError("No AI provider API key configured")


async def extract_text_from_file(file_path: str) -> str:
    """Extract text from a file (PDF, DOCX, TXT)"""
    file_ext = Path(file_path).suffix.lower()
    
    try:
        if file_ext == ".txt":
            # Read text file
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        
        elif file_ext == ".pdf":
            # Extract text from PDF
            try:
                from pypdf import PdfReader
                
                reader = PdfReader(file_path)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                
                return text
            except ImportError:
                # Fallback to pdfminer
                from pdfminer.high_level import extract_text
                return extract_text(file_path)
        
        elif file_ext in [".docx", ".doc"]:
            # Extract text from DOCX
            try:
                from docx import Document
                
                doc = Document(file_path)
                text = "\n".join([para.text for para in doc.paragraphs])
                return text
            except ImportError:
                # Fallback to antiword for .doc files
                import subprocess
                result = subprocess.run(
                    ["antiword", file_path],
                    capture_output=True,
                    text=True
                )
                return result.stdout
        
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
            
    except Exception as e:
        logger.error(f"Failed to extract text from {file_path}: {e}")
        raise ValueError(f"Failed to extract text from file: {e}")


async def chunk_document(text: str, chunk_size: int = 8000, overlap: int = 200) -> List[str]:
    """Chunk document text for LLM processing"""
    if not text:
        return []
    
    # Split by paragraphs first
    paragraphs = re.split(r'\n\s*\n', text)
    
    chunks = []
    current_chunk = ""
    current_size = 0
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        
        para_length = len(para)
        
        # If paragraph fits in current chunk
        if current_size + para_length <= chunk_size:
            if current_chunk:
                current_chunk += "\n\n" + para
            else:
                current_chunk = para
            current_size += para_length + 2  # +2 for the newlines
        else:
            # Add current chunk to chunks
            if current_chunk:
                chunks.append(current_chunk)
            
            # Start new chunk with overlap
            if chunks:
                overlap_text = chunks[-1][-overlap:] if len(chunks[-1]) >= overlap else chunks[-1]
                current_chunk = overlap_text + "\n\n" + para
                current_size = len(overlap_text) + 2 + para_length
            else:
                current_chunk = para
                current_size = para_length
    
    # Add the last chunk
    if current_chunk:
        chunks.append(current_chunk)
    
    return chunks


async def analyze_contract_with_ai(
    contract_text: str,
    file_name: str = "",
    focus_areas: Optional[List[str]] = None,
    custom_prompt: Optional[str] = None,
) -> Dict[str, Any]:
    """Analyze contract text using AI"""
    
    # Get AI provider
    provider = get_ai_provider()
    
    # Prepare system prompt
    system_prompt = """You are an expert legal assistant specializing in contract analysis. 
Your task is to analyze the provided contract text and extract comprehensive information.

You must provide your response in the following JSON format:
{
    "summary": {
        "overview": "Brief overview of the contract",
        "keyPoints": ["List of key points"],
        "partiesInvolved": ["List of parties"],
        "effectiveDate": "Effective date if mentioned",
        "terminationDate": "Termination date if mentioned"
    },
    "riskAnalysis": {
        "overallScore": 0-100,
        "riskLevel": "low|medium|high|critical",
        "riskFlags": [
            {
                "clause": "Specific clause text",
                "description": "Description of the risk",
                "severity": "low|medium|high|critical",
                "category": "liability|termination|indemnification|payment|confidentiality|other",
                "location": "Page or section",
                "recommendation": "Recommended action"
            }
        ],
        "riskDistribution": {
            "low": 0,
            "medium": 0,
            "high": 0,
            "critical": 0
        }
    },
    "extractedClauses": [
        {
            "type": "payment_terms|duration|renewal|termination|confidentiality|liability|indemnification|governing_law|dispute_resolution|force_majeure|other",
            "text": "Full clause text",
            "summary": "Brief summary of the clause",
            "startPage": 1,
            "endPage": 1
        }
    ],
    "missingClauses": [
        {
            "type": "Clause type that should be present",
            "description": "Why this clause is important",
            "importance": "low|medium|high|critical",
            "recommendation": "Suggested clause text or action"
        }
    ]
}

Important guidelines:
1. Be thorough and comprehensive in your analysis
2. Identify all potential risks and their severity
3. Extract all important clauses with their exact text
4. Note any missing clauses that are typically important
5. Provide actionable recommendations
6. Calculate risk score based on the severity and number of risk flags
7. Always respond with valid JSON, no markdown or other formatting"""

    # Prepare user message
    user_message = f"Please analyze the following contract:\n\n{contract_text}\n\n"
    
    if file_name:
        user_message = f"Contract file: {file_name}\n\n{user_message}"
    
    if focus_areas:
        user_message += f"\nFocus on these areas: {', '.join(focus_areas)}\n"
    
    if custom_prompt:
        user_message += f"\nCustom instructions: {custom_prompt}\n"
    
    # Prepare messages
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]
    
    # Get model to use
    model = settings.AI_MODEL if settings.AI_PROVIDER == "deepseek" else settings.AI_FALLBACK_MODEL
    
    # Call AI provider
    try:
        response = await provider.chat_completion(
            messages=messages,
            model=model,
            temperature=0.3,  # Lower temperature for more consistent results
            max_tokens=settings.AI_MAX_TOKENS,
        )
        
        # Parse response
        if "choices" in response and len(response["choices"]) > 0:
            content = response["choices"][0]["message"]["content"]
            
            # Try to parse JSON from response
            try:
                import json
                # Clean up the response to extract JSON
                content = content.strip()
                
                # Try to find JSON in the response
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    content = json_match.group()
                
                # Parse JSON
                result = json.loads(content)
                return result
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse AI response as JSON: {e}")
                logger.error(f"AI Response: {content}")
                
                # Return a structured response based on the text
                return {
                    "summary": {
                        "overview": "Analysis completed but response parsing failed",
                        "keyPoints": [],
                        "partiesInvolved": [],
                    },
                    "riskAnalysis": {
                        "overallScore": 0,
                        "riskLevel": "unknown",
                        "riskFlags": [],
                        "riskDistribution": {"low": 0, "medium": 0, "high": 0, "critical": 0},
                    },
                    "extractedClauses": [],
                    "missingClauses": [],
                    "rawResponse": content,
                }
        else:
            logger.error(f"Unexpected AI response format: {response}")
            return {
                "error": "Unexpected response format from AI provider",
                "response": response,
            }
            
    except Exception as e:
        logger.error(f"AI analysis failed: {e}")
        raise ValueError(f"AI analysis failed: {e}")


async def calculate_risk_score(risk_flags: List[Dict[str, Any]]) -> Tuple[float, str]:
    """Calculate overall risk score from risk flags"""
    if not risk_flags:
        return 0.0, "low"
    
    # Weight by severity
    severity_weights = {
        "low": 1,
        "medium": 3,
        "high": 5,
        "critical": 10,
    }
    
    total_score = 0
    for flag in risk_flags:
        severity = flag.get("severity", "low").lower()
        weight = severity_weights.get(severity, 1)
        total_score += weight
    
    # Normalize to 0-100 scale
    max_possible = len(risk_flags) * 10  # Assuming all critical
    if max_possible > 0:
        score = (total_score / max_possible) * 100
    else:
        score = 0
    
    # Determine risk level
    if score >= 80:
        risk_level = "critical"
    elif score >= 60:
        risk_level = "high"
    elif score >= 40:
        risk_level = "medium"
    else:
        risk_level = "low"
    
    return round(score, 2), risk_level
