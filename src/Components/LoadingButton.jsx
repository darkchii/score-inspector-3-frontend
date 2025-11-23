import { Button, CircularProgress } from "@mui/material";

function LoadingButton(props) {
  return (
    <Button
        {...props}
        disabled={props.loading || props.disabled}
        variant={props.variant || "contained"}
        color={props.color || "primary"}
    >{
        props.loading ? (
            <>
                <CircularProgress size={25} sx={{ mr: 1 }} />
            </>
        ): <>{props.children}</>
        }</Button>
  );
}

export default LoadingButton;