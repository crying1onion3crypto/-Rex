"""
Services Module
"""

from app.services.user import (
    create_user,
    get_user_by_id,
    get_user_by_email,
    update_user,
    delete_user,
    authenticate_user,
    get_api_key_by_key,
    create_api_key,
    get_user_api_keys,
    update_api_key,
    delete_api_key,
)
from app.services.contract import (
    create_contract,
    get_contract_by_id,
    get_user_contracts,
    update_contract,
    delete_contract,
    upload_contract_file,
    get_contract_count,
)
from app.services.analysis import (
    analyze_contract,
    get_contract_analysis,
    create_contract_analysis,
    update_contract_analysis,
)
from app.services.subscription import (
    get_user_subscription,
    create_free_subscription,
    upgrade_subscription,
    get_plans,
    get_plan_by_id,
)
from app.services.storage import (
    save_file,
    delete_file,
    get_file_path,
    get_file_info,
)
from app.services.ai import (
    extract_text_from_file,
    analyze_contract_with_ai,
    chunk_document,
)

__all__ = [
    # User services
    "create_user",
    "get_user_by_id",
    "get_user_by_email",
    "update_user",
    "delete_user",
    "authenticate_user",
    "get_api_key_by_key",
    "create_api_key",
    "get_user_api_keys",
    "update_api_key",
    "delete_api_key",
    # Contract services
    "create_contract",
    "get_contract_by_id",
    "get_user_contracts",
    "update_contract",
    "delete_contract",
    "upload_contract_file",
    "get_contract_count",
    # Analysis services
    "analyze_contract",
    "get_contract_analysis",
    "create_contract_analysis",
    "update_contract_analysis",
    # Subscription services
    "get_user_subscription",
    "create_free_subscription",
    "upgrade_subscription",
    "get_plans",
    "get_plan_by_id",
    # Storage services
    "save_file",
    "delete_file",
    "get_file_path",
    "get_file_info",
    # AI services
    "extract_text_from_file",
    "analyze_contract_with_ai",
    "chunk_document",
]
