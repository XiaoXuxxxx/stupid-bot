/* eslint-disable @typescript-eslint/ban-ts-comment */
import Queue from '@/src/audio/Queue';

import Track from '@/src/audio/Track';
console.log(Track);
jest.mock('@/src/audio/Track');

// mock track

// const thirdTrack = new Track('https://www.youtube.com/watch?v=3');
// const fourthTrack = new Track('https://www.youtube.com/watch?v=4');
// const fifthTrack = new Track('https://www.youtube.com/watch?v=5');
// const sixthTrack = new Track('https://www.youtube.com/watch?v=6');
// const seventhTrack = new Track('https://www.youtube.com/watch?v=7');
// const eighthTrack = new Track('https://www.youtube.com/watch?v=8');

describe('Queue::addTracks() test suite', () => {
  it('should have track when add track to queue', () => {
    const queue = new Queue();

    queue.addTracks(firstTrack);
    // @ts-ignore
    expect(queue.tracks).toStrictEqual([firstTrack]);
  });

  it('should get future track when get upcomming track', () => {
    const queue = new Queue();
    // @ts-ignore
    queue.currentTrackIndex = 2;

    queue.addTracks(
      firstTrack,
      secondTrack,
      thirdTrack,
      fourthTrack,
      fifthTrack
    );

    expect(queue.getUpcomingTracks()).toStrictEqual([fourthTrack, fifthTrack]);
  });

  it('should get past tracks when get previous tracks', () => {
    const queue = new Queue();
    // @ts-ignore
    queue.currentTrackIndex = 2;

    queue.addTracks(
      firstTrack,
      secondTrack,
      thirdTrack,
      fourthTrack,
      fifthTrack
    );

    expect(queue.getPreviousTracks()).toStrictEqual([firstTrack, secondTrack]);
  });
});

describe('Queue::prune() test suite', () => {
  it('should clear the previous tracks when prune tracks', () => {
    const queue = new Queue();
    // @ts-ignore
    queue.currentTrackIndex = 3;

    queue.addTracks(
      firstTrack,
      secondTrack, // tail track (1)
      thirdTrack, // tail track (2)
      fourthTrack, // <== current track
      fifthTrack,
      sixthTrack,
      seventhTrack,
      eighthTrack
    );

    queue.pruneTracks(2);

    expect(queue.getUpcomingTracks()).toStrictEqual([
      fifthTrack,
      sixthTrack,
      seventhTrack,
      eighthTrack
    ]);
    expect(queue.getPreviousTracks()).toStrictEqual([secondTrack, thirdTrack]);
    expect(queue.getCurrentTrack()).toStrictEqual(fourthTrack);
  });

  it('should prune the tracks even if the tail count is greater than the current track index', () => {
    const queue = new Queue();
    // @ts-ignore
    queue.currentTrackIndex = 3;

    queue.addTracks(
      firstTrack, // tail track (3)
      secondTrack, // tail track (4)
      thirdTrack, // tail track (5)
      fourthTrack, // <== current track
      fifthTrack,
      sixthTrack,
      seventhTrack,
      eighthTrack
    );

    queue.pruneTracks(5);

    expect(queue.getUpcomingTracks()).toStrictEqual([
      fifthTrack,
      sixthTrack,
      seventhTrack,
      eighthTrack
    ]);
    expect(queue.getPreviousTracks()).toStrictEqual([
      firstTrack,
      secondTrack,
      thirdTrack
    ]);
    expect(queue.getCurrentTrack()).toStrictEqual(fourthTrack);
  });

  it('should have no previous track when prune with 0 tail', () => {
    const queue = new Queue();
    // @ts-ignore
    queue.currentTrackIndex = 3;

    queue.addTracks(
      firstTrack,
      secondTrack,
      thirdTrack,
      fourthTrack, // <== current track
      fifthTrack,
      sixthTrack,
      seventhTrack,
      eighthTrack
    );

    queue.pruneTracks(0);

    expect(queue.getUpcomingTracks()).toStrictEqual([
      fifthTrack,
      sixthTrack,
      seventhTrack,
      eighthTrack
    ]);
    expect(queue.getPreviousTracks()).toStrictEqual([]);
    expect(queue.getCurrentTrack()).toStrictEqual(fourthTrack);
  });
});

describe('Queue::nextTrack() test suite', () => {
  it('should get the next track and increment the current track index', () => {
    const queue = new Queue();
    // @ts-ignore
    queue.currentTrackIndex = 2;

    queue.addTracks(
      firstTrack,
      secondTrack,
      thirdTrack, // <== current track
      fourthTrack,
      fifthTrack
    );

    expect(queue.nextTrack()).toStrictEqual(fourthTrack);
    expect(queue.getCurrentTrackIndex()).toBe(3);
    expect(queue.getCurrentTrack()).toStrictEqual(fourthTrack);
    expect(queue.getUpcomingTracks()).toStrictEqual([fifthTrack]);
  });

  it('should get null when there is no next track', () => {
    const queue = new Queue();
    // @ts-ignore
    queue.currentTrackIndex = 3;

    queue.addTracks(
      firstTrack,
      secondTrack,
      thirdTrack,
      fourthTrack // <== current track
    );

    expect(queue.nextTrack()).toBeNull();
    expect(queue.getCurrentTrackIndex()).toBe(3);
    expect(queue.getCurrentTrack()).toStrictEqual(fourthTrack);
  });

  it('should get null when there is no track', () => {
    const queue = new Queue();

    expect(queue.nextTrack()).toBeNull();
    expect(queue.getCurrentTrackIndex()).toBe(0);
    expect(queue.getCurrentTrack()).toBeNull();
  });
});

describe('Queue::previousTrack() test suite', () => {
  it('should get the previous track and decrement the current track index', () => {
    const queue = new Queue();
    // @ts-ignore
    queue.currentTrackIndex = 3;

    queue.addTracks(
      firstTrack,
      secondTrack,
      thirdTrack,
      fourthTrack, // <== current track
      fifthTrack
    );

    expect(queue.previousTrack()).toStrictEqual(thirdTrack);
    expect(queue.getCurrentTrackIndex()).toBe(2);
    expect(queue.getCurrentTrack()).toStrictEqual(thirdTrack);
    expect(queue.getPreviousTracks()).toStrictEqual([firstTrack, secondTrack]);
    expect(queue.getUpcomingTracks()).toStrictEqual([fourthTrack, fifthTrack]);
  });

  it('should get null when there is no previous track', () => {
    const queue = new Queue();
    // @ts-ignore
    queue.currentTrackIndex = 0;

    queue.addTracks(firstTrack); // <== current track

    expect(queue.previousTrack()).toBeNull();
    expect(queue.getCurrentTrackIndex()).toBe(0);
    expect(queue.getCurrentTrack()).toStrictEqual(firstTrack);
  });

  it('should get null when there is no track', () => {
    const queue = new Queue();

    expect(queue.previousTrack()).toBeNull();
    expect(queue.getCurrentTrackIndex()).toBe(0);
    expect(queue.getCurrentTrack()).toBeNull();
  });
});

describe('Queue::jumpToTrack() test suite', () => {
  it('should jump to the track and set the current track index', () => {
    const queue = new Queue();
    // @ts-ignore
    queue.currentTrackIndex = 2;

    queue.addTracks(
      firstTrack,
      secondTrack,
      thirdTrack, // <== current track
      fourthTrack,
      fifthTrack
    );

    expect(queue.jumpToTrack(4)).toStrictEqual(fifthTrack);
    expect(queue.getCurrentTrackIndex()).toBe(4);
    expect(queue.getCurrentTrack()).toStrictEqual(fifthTrack);
    expect(queue.getPreviousTracks()).toStrictEqual([
      firstTrack,
      secondTrack,
      thirdTrack,
      fourthTrack
    ]);
  });

  it('should get null when the track is not found', () => {
    const queue = new Queue();
    // @ts-ignore
    queue.currentTrackIndex = 2;

    queue.addTracks(
      firstTrack,
      secondTrack,
      thirdTrack, // <== current track
      fourthTrack,
      fifthTrack
    );

    expect(queue.jumpToTrack(5)).toBeNull();
    expect(queue.getCurrentTrackIndex()).toBe(2);
    expect(queue.getCurrentTrack()).toStrictEqual(thirdTrack);
    expect(queue.getPreviousTracks()).toStrictEqual([firstTrack, secondTrack]);
    expect(queue.getUpcomingTracks()).toStrictEqual([fourthTrack, fifthTrack]);
  });

  it('should get null when there is no track', () => {
    const queue = new Queue();

    expect(queue.jumpToTrack(3)).toBeNull();
    expect(queue.getCurrentTrackIndex()).toBe(0);
    expect(queue.getCurrentTrack()).toBeNull();
  });
});

describe('Queue::clearUpcomingTracks() test suite', () => {
  it('should clear the upcoming tracks', () => {
    const queue = new Queue();
    // @ts-ignore
    queue.currentTrackIndex = 2;

    queue.addTracks(
      firstTrack,
      secondTrack,
      thirdTrack, // <== current track
      fourthTrack,
      fifthTrack
    );

    queue.clearUpcomingTracks();

    expect(queue.getUpcomingTracks()).toStrictEqual([]);
    expect(queue.getPreviousTracks()).toStrictEqual([firstTrack, secondTrack]);
    expect(queue.getCurrentTrack()).toStrictEqual(thirdTrack);
  });

  it('should do nothing when there is no upcoming track', () => {
    const queue = new Queue();
    // @ts-ignore
    queue.currentTrackIndex = 2;

    queue.addTracks(
      firstTrack,
      secondTrack,
      thirdTrack // <== current track
    );

    queue.clearUpcomingTracks();

    expect(queue.getUpcomingTracks()).toStrictEqual([]);
    expect(queue.getPreviousTracks()).toStrictEqual([firstTrack, secondTrack]);
    expect(queue.getCurrentTrack()).toStrictEqual(thirdTrack);
  });

  it('should do nothing when there is no track', () => {
    const queue = new Queue();

    queue.clearUpcomingTracks();

    expect(queue.getUpcomingTracks()).toStrictEqual([]);
    expect(queue.getPreviousTracks()).toStrictEqual([]);
    expect(queue.getCurrentTrack()).toBeNull();
  });
});

describe('Queue::clearAll() test suite', () => {
  it('should clear all tracks', () => {
    const queue = new Queue();
    // @ts-ignore
    queue.currentTrackIndex = 2;

    queue.addTracks(
      firstTrack,
      secondTrack,
      thirdTrack, // <== current track
      fourthTrack,
      fifthTrack
    );

    queue.clearAll();

    expect(queue.getUpcomingTracks()).toStrictEqual([]);
    expect(queue.getPreviousTracks()).toStrictEqual([]);
    expect(queue.getCurrentTrack()).toBeNull();
    expect(queue.getCurrentTrackIndex()).toBe(0);
  });
});
