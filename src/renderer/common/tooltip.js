import Tooltip from "./Tooltip.svelte";

export function tooltip (node, {
        text = "",
        color = "default",
        position = "top",
        spacing = 3,
        x = 0,
        y = 0
    }) {
    
    let isComponentRendered = false;
    let component;
    let tooltipDOM;

    function renderTooltip() {

        let tooltipsLayer = document.getElementById("tooltips-layer");

        // Create Component
        component = new Tooltip({
            target: node,
            props: {
                text,
                color,
                position,
                x,
                y
            }
        });

        tooltipDOM = component.element;

        // Tooltip container
        if (!tooltipsLayer) {
            tooltipsLayer = Object.assign(document.createElement("div"), {
                className: "layer-container",
                id: "tooltips-layer"
            });
            document.body.appendChild(tooltipsLayer);
        }
    
        tooltipsLayer.appendChild(tooltipDOM);

        // Tooltip Positioning
        if (component) {
            if (position === "top") {
                component.x = node.getBoundingClientRect().left + (node.offsetWidth / 2) - (tooltipDOM.offsetWidth / 2);
                component.y = (node.getBoundingClientRect().top - tooltipDOM.offsetHeight - 5) - spacing;
            }
 else if (position === "bottom") {
                component.x = node.getBoundingClientRect().left + (node.offsetWidth / 2) - (tooltipDOM.offsetWidth / 2);
                component.y = (node.getBoundingClientRect().bottom + 5) + spacing;
            }
 else if (position === "left") {
                component.x = (node.getBoundingClientRect().left - tooltipDOM.offsetWidth - 5) - spacing;
                component.y = node.getBoundingClientRect().top + (node.offsetHeight / 2) - (tooltipDOM.offsetHeight / 2);
            }
 else if (position === "right") {
                component.x = (node.getBoundingClientRect().left + node.offsetWidth + 5) + spacing;
                component.y = node.getBoundingClientRect().top + (node.offsetHeight / 2) - (tooltipDOM.offsetHeight / 2);
            }
        }

        // Indicate that our tooltip instance is now rendered
        isComponentRendered = true;
    }

    function unmountTooltip() {
        
        const tooltipsLayer = document.getElementById("tooltips-layer");
        
        // Check if component is already rendered to prevent warnings
        if (isComponentRendered) {

            // Remove component
            component.$destroy();
            tooltipsLayer.remove();

            // Tooltip is no longer rendered, update our check
            isComponentRendered = false;
        }
    }

    // Add listeners for rendering/unrendering
    node.addEventListener("mouseenter", renderTooltip);
    node.addEventListener("mouseleave", unmountTooltip);
    node.addEventListener("focus", renderTooltip);
    node.addEventListener("blur", unmountTooltip);
    node.childNodes.forEach(child => {
        child.addEventListener("focus", renderTooltip);
    });
    node.childNodes.forEach(child => {
        child.addEventListener("blur", unmountTooltip);
    });

    return {
		destroy() {
            node.removeEventListener("mouseenter", renderTooltip);
            node.removeEventListener("mouseleave", unmountTooltip);
            node.removeEventListener("focus", renderTooltip);
            node.childNodes.forEach(child => {
                child.removeEventListener("focus", renderTooltip);
            });
            node.childNodes.forEach(child => {
                child.removeEventListener("blur", unmountTooltip);
            });
		}
	};
}