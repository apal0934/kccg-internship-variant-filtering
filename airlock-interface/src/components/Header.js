import { Icon, Menu } from "antd";

import { Link } from "react-router-dom";
import React from "react";

const Header = () => {
  return (
    <Menu mode="horizontal" theme="dark">
      <Menu.Item key="home">
        <Icon type="home" />
        Home
        <Link to={"/"} />
      </Menu.Item>
      <Menu.Item key="clinician">
        <Icon type="medicine-box" />
        Clinician
        <Link to={"/clinician"} />
      </Menu.Item>
      <Menu.Item key="researcher">
        <Icon type="search" />
        Researcher
        <Link to={"/researcher"} />
      </Menu.Item>
    </Menu>
  );
};

export default Header;
