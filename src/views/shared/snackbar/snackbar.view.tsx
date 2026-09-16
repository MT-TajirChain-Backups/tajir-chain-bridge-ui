import { FC, useEffect } from "react";

import  ErrorIcon from "src/assets/icons/error.svg?react";
import  SuccessIcon from "src/assets/icons/success.svg?react";
import  CloseIcon from "src/assets/icons/xmark.svg?react";
import { SNACKBAR_AUTO_HIDE_DURATION } from "src/constants";
import { Env, Message, ReportFormEnvEnabled } from "src/domain";
import { useSnackbarStyles } from "src/views/shared/snackbar/snackbar.styles";

type SnackbarProps = {
  message: Message;
  onClose: () => void;
  onReport: (error: string, reportForm: ReportFormEnvEnabled) => void;
  reportForm: Env["reportForm"];
}

export const Snackbar: FC<SnackbarProps> = ({ message, onClose, onReport, reportForm }) => {
  const classes = useSnackbarStyles();

  const Icon = ({ message }: { message: Message }): JSX.Element => {
    switch (message.type) {
      case "error":
      case "error-msg": {
        return <ErrorIcon className={classes.messageIcon} />;
      }
      case "success-msg": {
        return <SuccessIcon className={classes.messageIcon} />;
      }
    }
  };

  useEffect(() => {
    if (message.type !== "error") {
      const closingTimeoutId = setTimeout(onClose, SNACKBAR_AUTO_HIDE_DURATION);
      return () => clearTimeout(closingTimeoutId);
    }
  }, [message.type, onClose]);

  const getDisplayText = () => {
    if (message.type !== "error") { return message.text; }
    const parsedStr = message.parsed || "";
    const splitIndex = parsedStr.indexOf("\n>>>>>>>>>> Stringification");
    const actualMessage = splitIndex !== -1 ? parsedStr.substring(0, splitIndex) : parsedStr;
    return actualMessage || message.text || "An error occurred";
  };

  const text = getDisplayText();

  const wrapperClass = message.type === "error" || message.type === "error-msg" 
    ? classes.wrapperError 
    : classes.wrapperSuccess;

  return (
    <div className={classes.root}>
      <div className={`${classes.wrapper} ${wrapperClass}`}>
        <Icon message={message} />
        <p className={classes.message}>{text}</p>
        
        {message.type === "error" && reportForm?.isEnabled && (
          <button 
            className={classes.reportButton} 
            onClick={() => onReport(message.parsed, reportForm)}
          >
            Report
          </button>
        )}

        <button className={classes.closeButton} onClick={onClose}>
          <CloseIcon className={classes.closeIcon} />
        </button>
      </div>
    </div>
  );
};
