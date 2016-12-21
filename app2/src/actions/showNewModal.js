export default function showNewModal() {
    return (dispatch) => {
        return dispatch({
          type: 'SHOW_NEW_MODAL'
        });
    };
}
