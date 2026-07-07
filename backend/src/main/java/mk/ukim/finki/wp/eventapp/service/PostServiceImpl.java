package mk.ukim.finki.wp.eventapp.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.wp.eventapp.Repository.ArtistRepository;
import mk.ukim.finki.wp.eventapp.Repository.BarRepository;
import mk.ukim.finki.wp.eventapp.Repository.PostRepository;
import mk.ukim.finki.wp.eventapp.model.Artist;
import mk.ukim.finki.wp.eventapp.model.Bar;
import mk.ukim.finki.wp.eventapp.model.KadevecerSyncDTO;
import mk.ukim.finki.wp.eventapp.model.Post;
import mk.ukim.finki.wp.eventapp.model.ScrapedDataDTO;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class PostServiceImpl implements PostService {
    private final BarRepository barRepository;
    private final PostRepository postRepository;
    private final ArtistRepository artistRepository;

    @Override
    public void processScrapedData(List<ScrapedDataDTO> scrapedDataDTO) {

        for(ScrapedDataDTO dto : scrapedDataDTO){
            Bar bar=barRepository.findByName(dto.getBar());
            Post post=new Post();

            if(bar==null){
                Bar newBar=new Bar();
                newBar.setName(dto.getBar());
                bar=barRepository.save(newBar);
            }
            if(postRepository.existsByPostUrl(dto.getPost_url())){
                continue;
            }
                post.setBar(bar);
                post.setPostUrl(dto.getPost_url());
                post.setCaption(dto.getCaption());
                post.setImageUrl(dto.getImage_url());
                postRepository.save(post);
        }
    }

    @Override
    public List<Post> getScrapedData() {
        return postRepository.findAll();
    }

    @Override
    public List<Post> getScrapedDataByBarName(String barName) {
        return postRepository.findAllByBar_NameContainingIgnoreCase(barName);
    }

    @Override
    public void processKadevecerSync(KadevecerSyncDTO syncDTO) {
        // 1. Upsert artists by slug so re-runs refresh their details
        Map<String, Artist> artistsBySlug = new HashMap<>();
        if (syncDTO.getArtists() != null) {
            for (KadevecerSyncDTO.ArtistDTO dto : syncDTO.getArtists()) {
                Artist artist = artistRepository.findBySlug(dto.getSlug());
                if (artist == null) {
                    artist = new Artist();
                    artist.setSlug(dto.getSlug());
                }
                artist.setName(dto.getName());
                artist.setRole(dto.getRole());
                artist.setImageUrl(dto.getImage_url());
                artist.setInstagram(dto.getInstagram());
                artist.setFacebook(dto.getFacebook());
                artist.setYoutube(dto.getYoutube());
                artist.setKadevecerUrl(dto.getKadevecer_url());
                artistsBySlug.put(dto.getSlug(), artistRepository.save(artist));
            }
        }

        // 2. Insert events, skipping ones we already have (same as IG flow)
        if (syncDTO.getEvents() != null) {
            for (KadevecerSyncDTO.EventDTO dto : syncDTO.getEvents()) {
                // Resolve the bar (and refresh its address) even for known
                // events, so re-syncs can fill in venue data
                Bar bar = barRepository.findByName(dto.getBar());
                if (bar == null) {
                    Bar newBar = new Bar();
                    newBar.setName(dto.getBar());
                    bar = barRepository.save(newBar);
                }
                if (dto.getAddress() != null && !dto.getAddress().isBlank()) {
                    bar.setAddress(dto.getAddress());
                    bar = barRepository.save(bar);
                }

                if (postRepository.existsByPostUrl(dto.getPost_url())) {
                    continue;
                }

                Post post = new Post();
                post.setBar(bar);
                post.setPostUrl(dto.getPost_url());
                post.setCaption(dto.getCaption());
                post.setImageUrl(dto.getImage_url());
                post.setEventDate(parseDate(dto.getEvent_date()));

                if (dto.getArtist_slugs() != null) {
                    for (String slug : dto.getArtist_slugs()) {
                        Artist artist = artistsBySlug.get(slug);
                        if (artist == null) {
                            artist = artistRepository.findBySlug(slug);
                        }
                        if (artist != null) {
                            post.getArtists().add(artist);
                        }
                    }
                }
                postRepository.save(post);
            }
        }
    }

    private OffsetDateTime parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return OffsetDateTime.parse(value);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    @Override
    public List<Artist> getArtists() {
        return artistRepository.findAll();
    }

    @Override
    public Post createManualEvent(KadevecerSyncDTO.EventDTO dto) {
        Bar bar = barRepository.findByName(dto.getBar());
        if (bar == null) {
            Bar newBar = new Bar();
            newBar.setName(dto.getBar());
            bar = barRepository.save(newBar);
        }
        if (dto.getAddress() != null && !dto.getAddress().isBlank()) {
            bar.setAddress(dto.getAddress());
            bar = barRepository.save(bar);
        }

        Post post = new Post();
        post.setBar(bar);
        // postUrl is unique — generate one for hand-entered events without a link
        String url = dto.getPost_url();
        post.setPostUrl(url == null || url.isBlank()
                ? "manual://" + java.util.UUID.randomUUID()
                : url);
        post.setCaption(dto.getCaption());
        post.setImageUrl(dto.getImage_url());
        post.setEventDate(parseDate(dto.getEvent_date()));
        return postRepository.save(post);
    }

}
