declare module 'react-gtm-module' {
  interface TagManagerArgs {
    gtmId: string;
    dataLayer?: Record<string, unknown>[];
    dataLayerName?: string;
    auth?: string;
    preview?: string;
  }

  interface DataLayerArgs {
    dataLayer: Record<string, unknown>;
  }

  const TagManager: {
    initialize: (args: TagManagerArgs) => void;
    dataLayer: (args: DataLayerArgs) => void;
  };

  export default TagManager;
}

