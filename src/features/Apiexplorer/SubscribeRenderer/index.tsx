import React, { useState, useCallback, useEffect } from 'react';
import { TSocketSubscribableEndpointNames } from '@site/src/configs/websocket/types';
import { Button } from '@deriv/ui';
import styles from '../RequestJSONBox/RequestJSONBox.module.scss';
import useAuthContext from '@site/src/hooks/useAuthContext';
import useSubscription from '@site/src/hooks/useSubscription';
import useDisableSendRequest from '@site/src/hooks/useDisableSendRequest';
import LoginDialog from '../LoginDialog';
import PlaygroundSection from '../RequestResponseRenderer/PlaygroundSection';

export interface IResponseRendererProps<T extends TSocketSubscribableEndpointNames> {
  name: T;
  reqData?: string;
  auth: number;
}

function SubscribeRenderer<T extends TSocketSubscribableEndpointNames>({
  name,
  reqData,
  auth,
}: IResponseRendererProps<T>) {
  const { is_logged_in } = useAuthContext();
  const { disableSendRequest } = useDisableSendRequest();
  const { full_response, is_loading, subscribe, unsubscribe, error } = useSubscription<T>(name);
  const [response_state, setResponseState] = useState(false);
  const [toggle_modal, setToggleModal] = useState(false);

  useEffect(() => {
    if (error) {
      setToggleModal(true);
    }
  }, [error]);

  let json_data;
  try {
    json_data = JSON.parse(reqData);
  } catch (error) {
    json_data = '';
    console.error('something went wrong when parsing the json data: ', error);
  }

  const handleClick = useCallback(() => {
    unsubscribe();
    subscribe(json_data);
    setResponseState(true);
  }, [reqData, subscribe, unsubscribe]);

  const handleClear = () => {
    unsubscribe();
    setResponseState(false);
  };

  return (
    <div>
      <div className={styles.btnWrapper}>
        <Button color='primary' disabled={disableSendRequest(auth)} onClick={handleClick}>
          Send Request
        </Button>
        <Button color='secondary' onClick={handleClear}>
          Clear
        </Button>
      </div>
      {!is_logged_in && auth == 1 && toggle_modal ? (
        <LoginDialog setToggleModal={setToggleModal} />
      ) : (
        <PlaygroundSection
          loader={is_loading}
          response_state={response_state}
          full_response={full_response}
          error={error}
          name={name}
        />
      )}
    </div>
  );
}

export default SubscribeRenderer;
