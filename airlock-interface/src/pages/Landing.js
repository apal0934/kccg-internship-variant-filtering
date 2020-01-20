import { Icon } from "antd";
import React from "react";

function Landing(props) {
  return (
    <Icon
      type="smile"
      style={{
        fontSize: "256px",
        position: "absolute",
        left: "50%",
        top: "50%",
        margin: "-128px 0 0 -128px"
      }}
    />
  );
}

export default Landing;
