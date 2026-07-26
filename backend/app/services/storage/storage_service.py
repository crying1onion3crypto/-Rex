"""
Storage Service Implementation
"""

import logging
import os
import asyncio
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
from pathlib import Path

from app.config import settings

logger = logging.getLogger(__name__)


async def ensure_directory_exists(path: str) -> None:
    """Ensure directory exists"""
    path = Path(path)
    if not path.exists():
        path.mkdir(parents=True, exist_ok=True)


async def save_file(file_path: str, content: bytes) -> str:
    """Save a file to storage"""
    # Ensure upload directory exists
    upload_dir = Path(settings.UPLOAD_DIR)
    await ensure_directory_exists(upload_dir)
    
    # Create full path
    full_path = upload_dir / file_path
    await ensure_directory_exists(full_path.parent)
    
    # Write file
    full_path.write_bytes(content)
    
    logger.info(f"Saved file: {full_path}")
    
    return str(full_path)


async def delete_file(file_path: str) -> bool:
    """Delete a file from storage"""
    try:
        # Create full path
        upload_dir = Path(settings.UPLOAD_DIR)
        full_path = upload_dir / file_path
        
        if full_path.exists():
            full_path.unlink()
            logger.info(f"Deleted file: {full_path}")
            return True
        
        return False
    except Exception as e:
        logger.error(f"Failed to delete file {file_path}: {e}")
        return False


def get_file_path(file_path: str) -> str:
    """Get the full path for a stored file"""
    upload_dir = Path(settings.UPLOAD_DIR)
    full_path = upload_dir / file_path
    return str(full_path)


async def get_file_info(file_path: str) -> Optional[Dict[str, Any]]:
    """Get information about a stored file"""
    try:
        full_path = get_file_path(file_path)
        
        if not os.path.exists(full_path):
            return None
        
        stat = os.stat(full_path)
        
        return {
            "path": full_path,
            "size": stat.st_size,
            "modified_at": datetime.fromtimestamp(stat.st_mtime),
            "created_at": datetime.fromtimestamp(stat.st_ctime),
            "extension": os.path.splitext(file_path)[1].lower(),
        }
    except Exception as e:
        logger.error(f"Failed to get file info for {file_path}: {e}")
        return None


async def get_file_content(file_path: str) -> Optional[bytes]:
    """Get the content of a stored file"""
    try:
        full_path = get_file_path(file_path)
        
        if not os.path.exists(full_path):
            return None
        
        with open(full_path, "rb") as f:
            return f.read()
    except Exception as e:
        logger.error(f"Failed to read file {file_path}: {e}")
        return None


async def list_files(user_id: str, folder: str = "") -> List[Dict[str, Any]]:
    """List files for a user in a specific folder"""
    try:
        user_folder = Path(settings.UPLOAD_DIR) / "contracts" / user_id
        target_folder = user_folder / folder if folder else user_folder
        
        if not target_folder.exists():
            return []
        
        files = []
        for file_path in target_folder.glob("*"):
            if file_path.is_file():
                stat = file_path.stat()
                files.append({
                    "name": file_path.name,
                    "path": str(file_path.relative_to(user_folder)),
                    "size": stat.st_size,
                    "modified_at": datetime.fromtimestamp(stat.st_mtime),
                })
        
        return files
    except Exception as e:
        logger.error(f"Failed to list files for user {user_id}: {e}")
        return []
