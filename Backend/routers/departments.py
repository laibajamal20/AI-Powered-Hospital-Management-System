from fastapi import APIRouter
from schemas.department import DepartmentCreate, DepartmentUpdate
from services import department_service

router = APIRouter(
    prefix="/departments",
    tags=["Departments"]
)


@router.post("/")
async def add_department(department: DepartmentCreate):
    return department_service.add_department(
        department.department_id,
        department.department_name,
        department.location
    )


@router.get("/")
async def view_departments():
    return department_service.view_departments()


@router.get("/{department_id}")
async def view_department(department_id: int):
    return department_service.view_department(department_id)


@router.put("/{department_id}")
async def update_department(
    department_id: int,
    department: DepartmentUpdate
):
    return department_service.update_department(
        department_id,
        department.department_name,
        department.location
    )


@router.delete("/{department_id}")
async def delete_department(department_id: int):
    return department_service.delete_department(department_id)