from pydantic import BaseModel


class DepartmentCreate(BaseModel):
    department_id: int
    department_name: str
    location: str


class DepartmentUpdate(BaseModel):
    department_name: str
    location: str