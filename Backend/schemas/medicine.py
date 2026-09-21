from pydantic import BaseModel


class MedicineCreate(BaseModel):
    medicine_id: int
    medicine_name: str
    manufacturer: str
    price: float
    stock_quantity: int


class MedicineUpdate(BaseModel):
    medicine_name: str
    manufacturer: str
    price: float
    stock_quantity: int