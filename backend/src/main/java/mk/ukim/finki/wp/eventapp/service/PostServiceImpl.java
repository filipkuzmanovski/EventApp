package mk.ukim.finki.wp.eventapp.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.wp.eventapp.Repository.BarRepository;
import mk.ukim.finki.wp.eventapp.Repository.PostRepository;
import mk.ukim.finki.wp.eventapp.model.Bar;
import mk.ukim.finki.wp.eventapp.model.Post;
import mk.ukim.finki.wp.eventapp.model.ScrapedDataDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PostServiceImpl implements PostService {
    private final BarRepository barRepository;
    private final PostRepository postRepository;

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


}
