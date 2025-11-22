"""
Unit conversion service using Pint library
"""

from pint import DimensionalityError, UndefinedUnitError, UnitRegistry

from app.models.units import UnitConversionResponse

# Initialize unit registry
ureg = UnitRegistry()
# Enable support for contexts if needed, but usually Quantity() is enough for temp


def convert_units(value: float, from_unit: str, to_unit: str) -> UnitConversionResponse:
    """
    Convert a value from one unit to another

    Args:
        value: Value to convert
        from_unit: Source unit
        to_unit: Target unit

    Returns:
        UnitConversionResponse with conversion result
    """
    try:
        # Use Quantity constructor to handle offset units (temperature) correctly
        # quantity = value * ureg(from_unit)  <-- This is for delta temperatures mostly
        quantity = ureg.Quantity(value, ureg(from_unit))

        # Convert to target unit
        converted = quantity.to(to_unit)

        return UnitConversionResponse(
            success=True,
            message="Unit conversion successful",
            original_value=value,
            original_unit=from_unit,
            converted_value=float(converted.magnitude),
            converted_unit=to_unit,
            # Formula might be tricky for non-linear, keeping simple approximation
            conversion_formula=f"{value} {from_unit} = {converted.magnitude:.4f} {to_unit}",
        )

    except DimensionalityError:
        return UnitConversionResponse(
            success=False,
            message=f"Cannot convert from '{from_unit}' to '{to_unit}': incompatible dimensions",
            original_value=value,
            original_unit=from_unit,
        )

    except UndefinedUnitError as e:
        return UnitConversionResponse(
            success=False,
            message=f"Undefined unit: {str(e)}",
            original_value=value,
            original_unit=from_unit,
        )

    except Exception as e:
        return UnitConversionResponse(
            success=False,
            message=f"Error converting units: {str(e)}",
            original_value=value,
            original_unit=from_unit,
        )
