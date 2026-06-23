import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TreeMetaphorIcon } from "@/components/impact-metaphors/icons/metaphor-icons";
import { MetaphorScatterLayer } from "@/components/impact-metaphors/metaphor-scatter-layer";

describe("<MetaphorScatterLayer />", () => {
  it("renders one icon node per placement", () => {
    const { container } = render(
      <MetaphorScatterLayer
        className="relative h-64 w-full"
        count={12}
        phase="idle"
        renderIcon={(index) => <TreeMetaphorIcon instanceId={`test-${index}`} />}
        seed="test-12"
      />,
    );

    expect(container.querySelectorAll("svg")).toHaveLength(12);
    expect(screen.queryAllByRole("presentation", { hidden: true })).toHaveLength(12);
  });
});
