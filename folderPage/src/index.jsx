import React from "react";
import ReactDOM from "react-dom";
import Folder from "./components/Folder";

const rootStore = window.ROOT_STORE || {
  dir: '/',
  isRoot: true,
  files: [],
};

ReactDOM.render(
  <Folder store={rootStore}/>,
  document.getElementById('root')
);
