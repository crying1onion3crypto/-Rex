"""
Analysis Service Implementation
"""

import logging
import time
from datetime import datetime
from typing import Optional, Dict, Any

from prisma.models import ContractAnalysis as PrismaContractAnalysis

from app.config import settings
from app.core.dependencies.database import get_db
from app.models.analysis import ContractAnalysisResponse, AnalysisRequest
from app.models.contract import ContractStatus
from app.services.contract import get_contract_by_id
from app.services.ai import extract_text_from_file, analyze_contract_with_ai, calculate_risk_score
from app.services.storage import get_file_path

logger = logging.getLogger(__name__)


async def create_contract_analysis(
    contract_id: str,
    analysis_data: Dict[str, Any],
    processing_time: float = 0,
    model_used: str = "",
) -> ContractAnalysisResponse:
    """Create a contract analysis record"""
    db = await get_db()
    
    # Calculate risk score if not provided
    risk_flags = analysis_data.get("riskAnalysis", {}).get("riskFlags", [])
    if risk_flags:
        risk_score, risk_level = await calculate_risk_score(risk_flags)
    else:
        risk_score = 0.0
        risk_level = "low"
    
    # Create analysis
    analysis = await db.contractanalysis.create(
        data={
            "contractId": contract_id,
            "summary": analysis_data.get("summary"),
            "riskFlags": analysis_data.get("riskAnalysis", {}).get("riskFlags"),
            "extractedClauses": analysis_data.get("extractedClauses"),
            "missingClauses": analysis_data.get("missingClauses"),
            "detailedAnalysis": analysis_data.get("detailedAnalysis"),
            "processingTimeSeconds": processing_time,
            "modelUsed": model_used,
        }
    )
    
    # Update contract with risk score
    await db.contract.update(
        where={"id": contract_id},
        data={
            "riskScore": risk_score,
            "riskLevel": risk_level,
            "status": ContractStatus.COMPLETE,
            "processedAt": datetime.utcnow(),
        }
    )
    
    logger.info(f"Created contract analysis: {analysis.id}")
    
    return ContractAnalysisResponse(
        id=analysis.id,
        contractId=analysis.contractId,
        summary=analysis.summary,
        riskAnalysis={
            "overallScore": risk_score,
            "riskLevel": risk_level,
            "riskFlags": analysis.riskFlags,
            "riskDistribution": analysis_data.get("riskAnalysis", {}).get("riskDistribution", {}),
        },
        extractedClauses=analysis.extractedClauses,
        missingClauses=analysis.missingClauses,
        detailedAnalysis=analysis.detailedAnalysis,
        processingTimeSeconds=analysis.processingTimeSeconds,
        modelUsed=analysis.modelUsed,
        createdAt=analysis.createdAt,
        updatedAt=analysis.updatedAt,
    )


async def get_contract_analysis(contract_id: str) -> Optional[ContractAnalysisResponse]:
    """Get analysis for a contract"""
    db = await get_db()
    
    analysis = await db.contractanalysis.find_unique(
        where={"contractId": contract_id}
    )
    
    if not analysis:
        return None
    
    # Get risk score from contract
    contract = await db.contract.find_unique(
        where={"id": contract_id}
    )
    
    risk_score = contract.riskScore if contract else 0.0
    risk_level = contract.riskLevel if contract else "low"
    
    return ContractAnalysisResponse(
        id=analysis.id,
        contractId=analysis.contractId,
        summary=analysis.summary,
        riskAnalysis={
            "overallScore": risk_score,
            "riskLevel": risk_level,
            "riskFlags": analysis.riskFlags,
            "riskDistribution": analysis.summary.get("riskDistribution") if analysis.summary else {},
        },
        extractedClauses=analysis.extractedClauses,
        missingClauses=analysis.missingClauses,
        detailedAnalysis=analysis.detailedAnalysis,
        processingTimeSeconds=analysis.processingTimeSeconds,
        modelUsed=analysis.modelUsed,
        createdAt=analysis.createdAt,
        updatedAt=analysis.updatedAt,
    )


async def update_contract_analysis(
    contract_id: str,
    analysis_data: Dict[str, Any],
) -> ContractAnalysisResponse:
    """Update contract analysis"""
    db = await get_db()
    
    analysis = await db.contractanalysis.find_unique(
        where={"contractId": contract_id}
    )
    
    if not analysis:
        raise ValueError(f"Analysis for contract {contract_id} not found")
    
    # Update analysis
    updated_analysis = await db.contractanalysis.update(
        where={"id": analysis.id},
        data={
            "summary": analysis_data.get("summary", analysis.summary),
            "riskFlags": analysis_data.get("riskFlags", analysis.riskFlags),
            "extractedClauses": analysis_data.get("extractedClauses", analysis.extractedClauses),
            "missingClauses": analysis_data.get("missingClauses", analysis.missingClauses),
            "detailedAnalysis": analysis_data.get("detailedAnalysis", analysis.detailedAnalysis),
            "updatedAt": datetime.utcnow(),
        }
    )
    
    logger.info(f"Updated contract analysis: {updated_analysis.id}")
    
    return ContractAnalysisResponse(
        id=updated_analysis.id,
        contractId=updated_analysis.contractId,
        summary=updated_analysis.summary,
        riskAnalysis={
            "overallScore": 0,  # Will be recalculated
            "riskLevel": "unknown",
            "riskFlags": updated_analysis.riskFlags,
            "riskDistribution": {},
        },
        extractedClauses=updated_analysis.extractedClauses,
        missingClauses=updated_analysis.missingClauses,
        detailedAnalysis=updated_analysis.detailedAnalysis,
        processingTimeSeconds=updated_analysis.processingTimeSeconds,
        modelUsed=updated_analysis.modelUsed,
        createdAt=updated_analysis.createdAt,
        updatedAt=updated_analysis.updatedAt,
    )


async def analyze_contract(
    contract_id: str,
    user_id: str,
    analysis_request: Optional[AnalysisRequest] = None,
) -> ContractAnalysisResponse:
    """Analyze a contract using AI"""
    db = await get_db()
    
    # Get contract
    contract = await get_contract_by_id(contract_id, user_id)
    
    if not contract:
        raise ValueError(f"Contract with ID {contract_id} not found")
    
    # Check if already analyzed
    existing_analysis = await get_contract_analysis(contract_id)
    if existing_analysis:
        return existing_analysis
    
    # Update contract status to processing
    await db.contract.update(
        where={"id": contract_id},
        data={"status": ContractStatus.PROCESSING}
    )
    
    try:
        # Get file path
        file_path = get_file_path(contract.filePath)
        
        # Extract text from file
        start_time = time.time()
        contract_text = await extract_text_from_file(file_path)
        extraction_time = time.time() - start_time
        
        logger.info(f"Extracted text from {contract.fileName} in {extraction_time:.2f}s")
        
        # Analyze with AI
        start_time = time.time()
        
        analysis_result = await analyze_contract_with_ai(
            contract_text=contract_text,
            file_name=contract.fileName,
            focus_areas=analysis_request.focusAreas if analysis_request else None,
            custom_prompt=analysis_request.customPrompt if analysis_request else None,
        )
        
        processing_time = time.time() - start_time
        
        # Get model used
        model_used = settings.AI_MODEL if settings.AI_PROVIDER == "deepseek" else settings.AI_FALLBACK_MODEL
        
        logger.info(f"AI analysis completed in {processing_time:.2f}s")
        
        # Create analysis record
        analysis = await create_contract_analysis(
            contract_id=contract_id,
            analysis_data=analysis_result,
            processing_time=processing_time + extraction_time,
            model_used=model_used,
        )
        
        return analysis
        
    except Exception as e:
        logger.error(f"Failed to analyze contract {contract_id}: {e}")
        
        # Update contract status to failed
        await db.contract.update(
            where={"id": contract_id},
            data={
                "status": ContractStatus.FAILED,
                "processingError": str(e),
            }
        )
        
        raise ValueError(f"Contract analysis failed: {e}")
