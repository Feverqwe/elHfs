import * as React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import DialogActions from "@material-ui/core/DialogActions";
import ButtonGroup from "@material-ui/core/ButtonGroup";

const keyName = {
  ctime: 'Create time',
  name: 'Name',
  size: 'Size',
};

const SortChooseDialog = React.memo(({sortKey, changeSort, onClose}) => {
  const handleClose = React.useCallback((e, key) => {
    onClose();
  }, []);

  const handleChangeSort = React.useCallback((key) => {
    changeSort(key);
  }, []);

  return (
    <Dialog onClose={handleClose} open={true}>
      <DialogContent>
        <ButtonGroup orientation="vertical">
          {Object.entries(keyName).map(([type, name]) => {
            const [currentType, direction] = sortKey;
            return (
              <SortBtn
                key={type}
                type={type}
                name={name}
                active={currentType === type}
                direction={direction}
                onClick={handleChangeSort}
              />
            );
          })}
        </ButtonGroup>
        <DialogActions/>
      </DialogContent>
    </Dialog>
  );
});

const SortBtn = React.memo(({type, name, active, direction, onClick}) => {
  let icon;
  if (active && direction) {
    icon = (
      <ArrowDropUpIcon/>
    );
  } else {
    icon = (
      <ArrowDropDownIcon/>
    );
  }

  const handleClick = React.useCallback((e) => {
    e.preventDefault();
    if (active) {
      onClick([type, !direction]);
    } else {
      onClick([type, direction]);
    }
  }, [active, direction]);

  return (
    <Button
      onClick={handleClick}
      variant={active ? 'contained' : null}
      endIcon={icon}
    >{name}</Button>
  );
});

export default SortChooseDialog;