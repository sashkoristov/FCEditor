/**
 * Implementation of a nested swimlane layout
 *
 * @author Ben Walch, 2019-2020
 */
import mxgraph from '../../mxgraph';

const { mxGraphLayout } = mxgraph;

/**
 * NestedSwimlaneLayout
 *
 * walks through the graph group hierarchy and executes the given
 * swimlane layout on every swimlane.
 *
 * @param graph <mxGraph> instance
 * @param swimlaneLayout <mxGraphLayout> instance to layout the swimlanes
 * @param nestedFirst wether to perform the layout from the inside to the outside
 */
class NestedSwimlaneLayout extends mxGraphLayout {

    constructor(graph, swimlaneLayout, nestedFirst) {
        super(graph);

        this.swimlaneLayout = swimlaneLayout;
        this.nestedFirst = (nestedFirst != null) ? nestedFirst : false;

    }

    execute(parent) {

        if (this.swimlaneLayout == null) {
            return;
        }

        this.run(parent);
    }

    run(parent) {

        if (this.nestedFirst && this.graph.isSwimlane(parent)) {
            this.swimlaneLayout.execute(parent);
        }

        for (let child of this.graph.getModel().getChildCells(parent, true, false)) {
            this.run(child);
        }

        if (!this.nestedFirst && this.graph.isSwimlane(parent)) {
            this.swimlaneLayout.execute(parent);
        }
    }

}

export default NestedSwimlaneLayout;