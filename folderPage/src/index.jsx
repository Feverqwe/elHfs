import React from "react";
import ReactDOM from "react-dom";
import Folder from "./components/Folder";
import green from "@material-ui/core/colors/green";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import CssBaseline from "@material-ui/core/CssBaseline";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";

const rootStore = window.ROOT_STORE || {
  dir: '/',
  isRoot: true,
  files: [
    {
      name: 'test',
      type: 'dir',
      ctime: Date.now(),
      size: 0,
    },
    {
      name: 'a.txt',
      type: 'txt',
      ctime: Date.now(),
      size: 10,
    },
    {
      name: 'b.txt',
      type: 'txt',
      ctime: Date.now(),
      size: 50,
    },
    {
      name: 'test.mp4',
      type: 'txt',
      ctime: Date.now(),
      size: 550 * 1024 * 1024,
    },
    {
      name: 'test2.mp4',
      type: 'txt',
      ctime: Date.now(),
      size: 1545 * 1024 * 1024,
    },
  ],
};

const theme = createMuiTheme({
  palette: {
    primary: green,
    type: 'dark',
  }
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline/>
    <Folder store={rootStore}/>
  </ThemeProvider>,
  document.getElementById('root')
);
