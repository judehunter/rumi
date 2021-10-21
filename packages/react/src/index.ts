import {createRumi as coreCreateRumi} from '@rumi/core';
import {RumiConfig} from '@rumi/core/src/createRumi';
import React from 'react';

export const createRumi = <T extends RumiConfig>(cfg: T) => {
  const createdRumi = coreCreateRumi(cfg);

  const RumiElement = (props) => {
    const {css, children = [], __rumi_elem_type__, ...restProps} = props;
    const newProps = {...restProps, className: createdRumi.css(css)()};
    return React.createElement(__rumi_elem_type__, newProps, ...children);
  };

  const createRumiProps = (type: React.ElementType, props: any) => {
    return {__rumi_elem_type__: type, ...props};
  };

  const jsx = (type, props, ...children) => {
    if (!Object.prototype.hasOwnProperty.call(props ?? {}, 'css')) {
      return React.createElement(type, props, ...children);
    }

    return React.createElement(
      RumiElement,
      createRumiProps(type, props),
      ...children,
    );
  };
  return {jsx, ...createdRumi};
};
