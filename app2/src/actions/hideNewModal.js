export default function hideNewModal() {
    return (dispatch) => {
        return dispatch({
          type: 'HIDE_NEW_MODAL'
        });
    };
}
