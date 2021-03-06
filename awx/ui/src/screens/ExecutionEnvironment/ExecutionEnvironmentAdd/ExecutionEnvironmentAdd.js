import React, { useState } from 'react';
import { Card, PageSection } from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';

import { ExecutionEnvironmentsAPI } from 'api';
import { Config } from 'contexts/Config';
import { CardBody } from 'components/Card';
import ExecutionEnvironmentForm from '../shared/ExecutionEnvironmentForm';

function ExecutionEnvironmentAdd() {
  const history = useHistory();
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (values) => {
    try {
      const { data: response } = await ExecutionEnvironmentsAPI.create({
        ...values,
        credential: values.credential?.id,
        organization: values.organization?.id,
      });
      history.push(`/execution_environments/${response.id}/details`);
    } catch (error) {
      setSubmitError(error);
    }
  };

  const handleCancel = () => {
    history.push(`/execution_environments`);
  };

  const hubParams = {
    description: '',
    image: '',
    name: '',
  };

  history.location.search
    .replace(/^\?/, '')
    .split('&')
    .map((s) => s.split('='))
    .forEach(([key, val]) => {
      if (!(key in hubParams)) {
        return;
      }
      hubParams[key] = decodeURIComponent(val);
    });

  return (
    <PageSection>
      <Card>
        <CardBody>
          <Config>
            {({ me }) => (
              <ExecutionEnvironmentForm
                onSubmit={handleSubmit}
                submitError={submitError}
                onCancel={handleCancel}
                me={me || {}}
                executionEnvironment={hubParams}
              />
            )}
          </Config>
        </CardBody>
      </Card>
    </PageSection>
  );
}

export default ExecutionEnvironmentAdd;
