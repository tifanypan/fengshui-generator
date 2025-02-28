@router.put("/{floor_plan_id}/compass")
async def update_compass_orientation(
    floor_plan_id: int,
    orientation: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Update compass orientation for a floor plan."""
    # Verify floor plan exists
    floor_plan = db.query(FloorPlan).filter(FloorPlan.id == floor_plan_id).first()
    if not floor_plan:
        return {"success": False, "error": "Floor plan not found"}
    
    # Validate orientation
    valid_orientations = ["North", "East", "South", "West"]
    if orientation not in valid_orientations:
        return {"success": False, "error": f"Invalid orientation: {orientation}. Must be one of: {valid_orientations}"}
    
    # Update orientation
    floor_plan.compass_orientation = orientation
    db.commit()
    
    return {"success": True, "orientation": orientation}