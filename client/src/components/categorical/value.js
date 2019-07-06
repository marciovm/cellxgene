// jshint esversion: 6
import { connect } from "react-redux";
import React from "react";

import {
  Button,
  Tooltip,
  InputGroup,
  Menu,
  MenuItem,
  Popover,
  Position,
  PopoverInteractionKind
} from "@blueprintjs/core";
import Occupancy from "./occupancy";
import { countCategoryValues2D } from "../../util/stateManager/worldUtil";
import * as globals from "../../globals";

@connect(state => ({
  categoricalSelection: state.categoricalSelection,
  annotations: state.annotations,
  colorScale: state.colors.scale,
  colorAccessor: state.colors.colorAccessor,
  schema: state.world?.schema,
  world: state.world
}))
class CategoryValue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editedLabelText: ""
    };
  }

  handleDeleteValue = () => {
    const {
      dispatch,
      metadataField,
      categoryIndex,
      categoricalSelection
    } = this.props;
    const category = categoricalSelection[metadataField];
    const label = category.categoryValues[categoryIndex];
    dispatch({
      type: "delete label",
      metadataField,
      label
    });
  };

  handleAddCurrentSelectionToThisLabel = () => {
    const {
      dispatch,
      metadataField,
      categoryIndex,
      categoricalSelection
    } = this.props;
    const category = categoricalSelection[metadataField];
    const label = category.categoryValues[categoryIndex];
    dispatch({
      type: "label current cell selection",
      metadataField,
      categoryIndex,
      label
    });
  };

  handleEditValue = () => {
    const {
      dispatch,
      metadataField,
      categoryIndex,
      categoricalSelection
    } = this.props;
    const { editedLabelText } = this.state;
    const category = categoricalSelection[metadataField];
    const label = category.categoryValues[categoryIndex];
    dispatch({
      type: "label edited",
      editedLabel: editedLabelText,
      metadataField,
      categoryIndex,
      label
    });
    this.setState({ editedLabelText: "" });
  };

  activateEditLabelMode = () => {
    const { dispatch, metadataField, categoryIndex } = this.props;
    dispatch({
      type: "activate edit label mode",
      metadataField,
      categoryIndex
    });
  };

  cancelEdit = () => {
    const { dispatch, metadataField, categoryIndex } = this.props;
    dispatch({
      type: "cancel edit label mode",
      metadataField,
      categoryIndex
    });
  };

  toggleOff = () => {
    const { dispatch, metadataField, categoryIndex } = this.props;
    dispatch({
      type: "categorical metadata filter deselect",
      metadataField,
      categoryIndex
    });
  };

  toggleOn = () => {
    const { dispatch, metadataField, categoryIndex } = this.props;
    dispatch({
      type: "categorical metadata filter select",
      metadataField,
      categoryIndex
    });
  };

  handleMouseEnter = () => {
    const { dispatch, metadataField, categoryIndex } = this.props;
    dispatch({
      type: "category value mouse hover start",
      metadataField,
      categoryIndex
    });
  };

  handleMouseExit = () => {
    const { dispatch, metadataField, categoryIndex } = this.props;
    dispatch({
      type: "category value mouse hover end",
      metadataField,
      categoryIndex
    });
  };

  render() {
    const {
      categoricalSelection,
      metadataField,
      categoryIndex,
      colorAccessor,
      colorScale,
      i,
      schema,
      world,
      isUserAnno,
      annotations
    } = this.props;

    if (!categoricalSelection) return null;

    const category = categoricalSelection[metadataField];
    const selected = category.categoryValueSelected[categoryIndex];
    const count = category.categoryValueCounts[categoryIndex];
    const value = category.categoryValues[categoryIndex];
    const displayString = String(
      category.categoryValues[categoryIndex]
    ).valueOf();

    /* this is the color scale, so add swatches below */
    const isColorBy = metadataField === colorAccessor;
    let categories = null;
    let occupancy = null;

    if (isColorBy && schema) {
      categories = schema.annotations.obsByName[colorAccessor]?.categories;
    }

    if (colorAccessor && !isColorBy && categoricalSelection[colorAccessor]) {
      const globalOccupancy = countCategoryValues2D(
        metadataField,
        colorAccessor,
        world.obsAnnotations
      );
      occupancy = globalOccupancy.get(category.categoryValues[categoryIndex]);
    }

    return (
      <div
        key={i}
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between"
        }}
        data-testclass="categorical-row"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseExit}
      >
        <div
          style={{
            margin: 0,
            padding: 0,
            userSelect: "none",
            width: globals.leftSidebarWidth - 240,
            display: "flex",
            justifyContent: "flex-start"
          }}
        >
          <label className="bp3-control bp3-checkbox">
            <input
              onChange={selected ? this.toggleOff : this.toggleOn}
              data-testclass="categorical-value-select"
              data-testid={`categorical-value-select-${metadataField}-${displayString}`}
              checked={selected}
              type="checkbox"
            />
            <span className="bp3-control-indicator" />
            <span
              data-testid={`categorical-value-${metadataField}-${displayString}`}
              data-testclass="categorical-value"
            >
              {annotations.isEditingLabelName &&
              annotations.labelEditable.category === metadataField &&
              annotations.labelEditable.label === categoryIndex
                ? null
                : displayString}
            </span>
          </label>

          {isUserAnno &&
          annotations.isEditingLabelName &&
          annotations.labelEditable.category === metadataField &&
          annotations.labelEditable.label === categoryIndex ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                this.handleEditValue();
              }}
            >
              <InputGroup
                style={{ position: "relative", top: -1 }}
                ref={input => {
                  this.editableInput = input;
                }}
                small
                onChange={e => {
                  this.setState({ editedLabelText: e.target.value });
                }}
                defaultValue={displayString}
                rightElement={
                  <Button
                    minimal
                    style={{ position: "relative", top: -1 }}
                    type="button"
                    icon="small-tick"
                    data-testclass="submitEdit"
                    data-testid="submitEdit"
                    onClick={this.handleEditValue}
                  />
                }
              />
            </form>
          ) : null}
          {/*
            CANCEL IT, WITH BUTTON, ESCAPE KEY, CLICK OUT, UNDO?

            <Button
            minimal
            style={{ position: "relative", top: -1 }}
            type="button"
            icon="cross"
            data-testclass="submitEdit"
            data-testid="submitEdit"
            onClick={this.cancelEdit}
          /> */}
        </div>
        <span style={{ flexShrink: 0 }}>
          {occupancy && !annotations.isEditingLabelName ? (
            <Occupancy occupancy={occupancy} {...this.props} />
          ) : null}
        </span>
        <span>
          <span
            data-testclass="categorical-value-count"
            data-testid={`categorical-value-count-${metadataField}-${displayString}`}
          >
            {count}
          </span>

          <svg
            display={isColorBy && categories ? "auto" : "none"}
            style={{
              marginLeft: 5,
              width: 11,
              height: 11,
              backgroundColor:
                isColorBy && categories
                  ? colorScale(categories.indexOf(value))
                  : "inherit"
            }}
          />
          {isUserAnno ? (
            <Popover
              interactionKind={PopoverInteractionKind.HOVER}
              boundary="window"
              position={Position.RIGHT}
              content={
                <Menu>
                  <MenuItem
                    icon="plus"
                    data-testclass="handleAddCurrentSelectionToThisLabel"
                    data-testid={`handleAddCurrentSelectionToThisLabel-${metadataField}`}
                    onClick={this.handleAddCurrentSelectionToThisLabel}
                    text="Add current cell selection to this label"
                  />
                  <MenuItem
                    icon="edit"
                    text="Edit this label's name"
                    data-testclass="handleEditValue"
                    data-testid={`handleEditValue-${metadataField}`}
                    onClick={this.activateEditLabelMode}
                  />
                  <MenuItem
                    icon="delete"
                    intent="danger"
                    data-testclass="handleDeleteValue"
                    data-testid={`handleDeleteValue-${metadataField}`}
                    onClick={this.handleDeleteValue}
                    text="Delete this value, and reassign all cells to type 'unknown'"
                  />
                </Menu>
              }
            >
              <Button
                style={{ marginLeft: 0, position: "relative", top: -1 }}
                data-testclass="seeActions"
                data-testid={`seeActions-${metadataField}`}
                icon="more"
                small
                minimal
              />
            </Popover>
          ) : null}
        </span>
      </div>
    );
  }
}

export default CategoryValue;
