import Overlay from './overlay.js';

const defaults = {
  id: '',
  align: 'top-left',
  class: '',
  content: 'This overlay will show up while the video is playing',
  debug: false,
  showBackground: true,
  overlays: []
};

export default function overlays(config) {

  const settings = Object.assign(defaults, config);

  const overlays = settings.overlays;

  // todo - clean up overlays

  // We don't want to keep the original array of overlay options around
  // because it doesn't make sense to pass it to each Overlay component.
  delete settings.overlays;

  // get player
  const context = cast.framework.CastReceiverContext.getInstance();
  const playerManager = context.getPlayerManager();

  const overlays_ = overlays.map(o => {
    const config = Object.assign({}, settings, o);
    const overlay = new Overlay(playerManager, config);
    overlay.createEl();

    return overlay;
  });

  const chromecastDiv = document.getElementsByClassName('chromecast');
  overlays_.forEach(overlay => {
    chromecastDiv[0].appendChild(overlay.el());
  });

  return overlays_;
}
