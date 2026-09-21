from database import conn


def add_department(department_id, department_name, location):
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO departments
        (department_id, department_name, location)
        VALUES (%s, %s, %s)
    """, (
        department_id,
        department_name,
        location
    ))

    conn.commit()
    cursor.close()

    return {"message": "Department added successfully"}


def view_departments():
    cursor = conn.cursor()

    cursor.execute("""
        SELECT department_id,
               department_name,
               location
        FROM departments
        ORDER BY department_id
    """)

    departments = cursor.fetchall()
    cursor.close()

    return departments


def view_department(department_id):
    cursor = conn.cursor()

    cursor.execute("""
        SELECT department_id,
               department_name,
               location
        FROM departments
        WHERE department_id = %s
    """, (department_id,))

    department = cursor.fetchone()
    cursor.close()

    if department is None:
        return {"message": "Department not found"}

    return {
        "department_id": department[0],
        "department_name": department[1],
        "location": department[2]
    }


def update_department(
    department_id,
    department_name,
    location
):
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE departments
        SET department_name = %s,
            location = %s
        WHERE department_id = %s
    """, (
        department_name,
        location,
        department_id
    ))

    conn.commit()

    rows_updated = cursor.rowcount
    cursor.close()

    if rows_updated == 0:
        return {"message": "Department not found"}

    return {"message": "Department updated successfully"}


def delete_department(department_id):
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM departments
        WHERE department_id = %s
    """, (department_id,))

    conn.commit()

    rows_deleted = cursor.rowcount
    cursor.close()

    if rows_deleted == 0:
        return {"message": "Department not found"}

    return {"message": "Department deleted successfully"}