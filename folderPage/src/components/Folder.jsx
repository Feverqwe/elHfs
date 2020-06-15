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

const filesize = require('filesize');

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
}));

const Folder = React.memo(({store}) => {
  const classes = useStyles();

  return (
    <List
      component="nav"
      subheader={
        <ListSubheader component="div">
          {store.dir}
        </ListSubheader>
      }
      className={classes.root}
    >
      {!store.isRoot && (
        <ListItem button component={'a'} href={'../'}>
          <ListItemIcon>
            <ArrowBackIcon/>
          </ListItemIcon>
          <ListItemText primary="Back"/>
        </ListItem>
      )}
      {store.files.map((file) => {
        return <File key={file.type + '_' + file.name} file={file}/>
      })}
    </List>
  );
});

const File = React.memo(({file: {size, ctime, name, type}}) => {
  const sizeStr = React.useMemo(() => {
    let hSize = '';
    try {
      if (size > 0) {
        hSize = filesize(size);
      }
    } catch (err) {
      // pass
    }
    return hSize;
  }, [size]);

  const dateStr = React.useMemo(() => {
    return dateToStr(new Date(ctime));
  }, [ctime]);

  return (
    <ListItem button component={'a'} href={encodeURIComponent(name)}>
      <ListItemIcon>
        {type === 'dir' && (
          <FolderIcon/>
        )}
        {type !== 'dir' && (
          <InsertDriveFileIcon/>
        )}
      </ListItemIcon>
      <ListItemText primary={name} secondary={sizeStr + ' ' + dateStr}/>
    </ListItem>
  );
});

function dateToStr(date) {
  const dateStr = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(v => (v < 10 ? '0' : '') + v).join('-');
  const timeStr = [date.getHours(), date.getMinutes(), date.getSeconds()].map(v => (v < 10 ? '0' : '') + v).join('-');
  return `${dateStr} ${timeStr}`;
}

export default Folder;