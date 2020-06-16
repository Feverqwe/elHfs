import * as React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import FolderIcon from '@material-ui/icons/Folder';
import MovieIcon from '@material-ui/icons/Movie';
import AudiotrackIcon from '@material-ui/icons/Audiotrack';
import ImageIcon from '@material-ui/icons/Image';
import DescriptionIcon from '@material-ui/icons/Description';

const mime = require('mime');
const filesize = require('filesize');

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  pathLine: {
    lineHeight: 'normal',
    wordBreak: 'break-all',
    padding: '6px',
    backgroundColor: theme.palette.background.paper,
  }
}));

const iconStyle = {
  minWidth: '42px',
};

const Folder = React.memo(({store}) => {
  const classes = useStyles();

  return (
    <List
      component="nav"
      subheader={
        <ListSubheader component="div" className={classes.pathLine}>
          {store.dir}
        </ListSubheader>
      }
      className={classes.root}
    >
      {!store.isRoot && (
        <ListItem button component={'a'} href={'../'}>
          <ListItemIcon style={iconStyle}>
            <ArrowBackIcon/>
          </ListItemIcon>
          <ListItemText primary="Back"/>
        </ListItem>
      )}
      {store.files.map((file) => {
        return <File key={file.isDir + '_' + file.name} file={file}/>
      })}
    </List>
  );
});

const useStylesFile = makeStyles((theme) => ({
  name: {
    wordBreak: 'break-word',
  },
  subLine: {
    display: 'flex',
    justifyContent: 'space-between',
  }
}));

const File = React.memo(({file: {size, ctime, name, isDir}}) => {
  const classes = useStylesFile();

  const sizeStr = React.useMemo(() => {
    let hSize = null;
    try {
      if (!isDir) {
        const [value, symbol] = filesize(size, {
          output: 'array'
        });
        hSize = `${parseInt(value * 10, 10) / 10} ${symbol}`;
      }
    } catch (err) {
      // pass
    }
    return hSize;
  }, [size, isDir]);

  const dateStr = React.useMemo(() => {
    return dateToStr(new Date(ctime));
  }, [ctime]);

  const Icon = React.useMemo(() => {
    if (isDir) {
      return (
        <FolderIcon/>
      );
    }

    const mimeType = mime.getType(name);
    const m = /^([^\/]+)/.exec(mimeType);
    const generalType = m && m[1];
    switch (generalType) {
      case 'video': {
        return (
          <MovieIcon/>
        );
      }
      case 'audio': {
        return (
          <AudiotrackIcon/>
        );
      }
      case 'image': {
        return (
          <ImageIcon/>
        );
      }
      case 'text': {
        return (
          <DescriptionIcon/>
        );
      }
      default: {
        return (
          <InsertDriveFileIcon/>
        );
      }
    }
  }, [name, isDir]);

  return (
    <ListItem button component={'a'} href={encodeURIComponent(name)}>
      <ListItemIcon style={iconStyle}>
        {Icon}
      </ListItemIcon>
      <ListItemText primary={name} secondary={<div className={classes.subLine}>
        <div>{dateStr}</div>
        <div>{sizeStr}</div>
      </div>} secondaryTypographyProps={{component: 'div'}} className={classes.name}/>
    </ListItem>
  );
});

function dateToStr(date) {
  const dateStr = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(v => (v < 10 ? '0' : '') + v).join('-');
  const timeStr = [date.getHours(), date.getMinutes(), date.getSeconds()].map(v => (v < 10 ? '0' : '') + v).join('-');
  return `${dateStr} ${timeStr}`;
}

export default Folder;