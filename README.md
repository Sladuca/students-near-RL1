# Geodes

Geodes is a geocaching dapp that aims to make geocaching more social using Non-Fungible Tokens that we call 'geodes'. It uses a smart contract to allow individuals to create geocaches, publish their coordinates, trade geodes with other users and geocachers, and more. This repo contains an proof of concept MVP that implements the bare functionality using React and a smart contract written using NEAR protocol's Rust SDK.

## Demo

You can see a video demo of our app [here](https://drive.google.com/open?id=1tBIoSHm8O_V5N1x_sD2ghOMtJu4-dBAc) and a deployed version here. The demo follows the following steps:

1. Create a geocache using which gets asigned an ID, and the dapp would generate a QR code (not implemented here for the sake of MVP) containing that ID to place inside the geocache.
2. A geocacher mints geodes
3. A geocacher find that geocache and signs it on the blockchain - then they can trade geodes with the geocache.

## Value Proposition

Geocaching is a global activity where individuals hide boxes called 'geocaches' and then post the coordinates on the internet, advertising for participants called 'geocachers' to physically find the geocache. Every geocache contains a log of signatures of everyone who finds the geocache and the date they signed it so geocachers can see all of the people who found it before them. Geocachers also tend to put an item the signifies their identity, oftentimes a physical coin, into the geocache, and they can also trade items with the geocache. In this way, the items placed in the box can move around the globe as geocachers pick up items and move them to other caches.

While there are over 3 million geocaches around the world, and the community is very large, it is still relatively non-interactive. A log alone does not convey a lot of a sense of community - logs are often of very limited size and the paper is typically exposed to the elements, subjecting itself to possible ruin. Additionally, there's very little actual identity attached to the objects poeple place in the geocaches, and the capacity is limited by the geocache's volume, which is oftentimes very small. Furthermore, Geocaching's geographically distributed nature makes it rather unlikely that you meet other geocachers while you’re doing it.

Representing geocaches and their logs with a smart contract that allows geocachers to mint their own NFTs, or 'geodes', can improve the social interaction level of geocaching in the following ways:

* Geocachers can place arbitrary messages and data into their geodes. For example, one could place a picture of their dog, their twitter handle, or their favorite quote.
* Each geode is uniquely identifiable and can be traded with geocaches. By inspecting the transaction history, one can view the list of geocaches each geode has been to, and thus can trace each geode's journey across the globe. This makes the existence of the community at large more apparent to both geocachers and cache creators.
* The dapp knows when people find geocaches in real-time, and thus community members in the area can know others are nearby and meet each other. This is especially beneficial because oftentimes geocaching takes individuals to far-away places they are not familiar with, and having someone to reccomend lodging / food can result in strong new friendships.
* The use of a blockchain also allows a social economy for geocaching to emerge - for example geodes that have traveled further might be more valuable, or perhaps geodes created by well-known members of the community might be more valuable.

## Quickstart

Prerequisites: nodejs, yarn.

To run locally:

1. clone this repo
2. `yarn dev`
3. `yarn dev` - note, this will deploy the contract to the test network.