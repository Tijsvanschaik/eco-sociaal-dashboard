import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QuantityFields } from "@/components/registration/quantity-fields";

describe("<QuantityFields />", () => {
  it("keeps partial decimal input visible while typing", () => {
    const onEcoChange = vi.fn();

    render(
      <QuantityFields
        onEcoBlur={vi.fn()}
        onEcoChange={onEcoChange}
        onSocialBlur={vi.fn()}
        onSocialChange={vi.fn()}
        quantity={0}
        socialQuantity={0}
      />,
    );

    const ecoInput = screen.getByRole("textbox", { name: "Eco-hoeveelheid" });

    fireEvent.focus(ecoInput);
    fireEvent.change(ecoInput, { target: { value: "0." } });

    expect(ecoInput).toHaveValue("0.");
    expect(onEcoChange).toHaveBeenCalledWith(0);

    fireEvent.change(ecoInput, { target: { value: "0.5" } });

    expect(ecoInput).toHaveValue("0.5");
    expect(onEcoChange).toHaveBeenLastCalledWith(0.5);
  });
});
